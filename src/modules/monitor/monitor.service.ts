import { Injectable } from "@nestjs/common"
import { ConfigService as NestConfigService } from "@nestjs/config"
import { metrics } from "@opentelemetry/api"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto"
import { Resource } from "@opentelemetry/resources"
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { BatchSpanProcessor, NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions"

@Injectable()
export class MonitorService {
    private serviceName: string
    private traceExporterUrl: string
    private metricsExporterUrl: string

    private provider: NodeTracerProvider
    private meterProvider: MeterProvider

    private otlpExporter: OTLPTraceExporter
    private metricExporter: OTLPMetricExporter

    constructor(private readonly nestConfigService: NestConfigService) {
        this.serviceName = this.nestConfigService.get<string>("SERVICE_NAME") as string
        this.traceExporterUrl = this.nestConfigService.get<string>("TRACE_EXPORTER_URL") as string
        this.metricsExporterUrl = this.nestConfigService.get<string>("OTEL_EXPORTER_OTLP_ENDPOINT") as string

        this.setup()
    }

    getTracer(name = this.serviceName) {
        return this.provider.getTracer(name)
    }

    getMeter(name = this.serviceName) {
        return metrics.getMeter(name)
    }

    private setup() {
        const resource = new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName
        })

        this.otlpExporter = new OTLPTraceExporter({
            url: this.traceExporterUrl
        })

        this.metricExporter = new OTLPMetricExporter({
            url: this.metricsExporterUrl
        })

        const metricReader = new PeriodicExportingMetricReader({
            exporter: this.metricExporter,
            exportIntervalMillis: 5000
        })

        this.meterProvider = new MeterProvider({
            resource
        })
        this.meterProvider.addMetricReader(metricReader)
        metrics.setGlobalMeterProvider(this.meterProvider)

        this.provider = new NodeTracerProvider({
            resource
        })

        // if (!this.traceExporterUrl) {
        //     const consoleExporter = new ConsoleSpanExporter()
        //     this.provider.addSpanProcessor(new BatchSpanProcessor(consoleExporter))
        // }

        this.provider.addSpanProcessor(new BatchSpanProcessor(this.otlpExporter))

        this.provider.register()

        console.log("Provisioning initialized")
    }

    async shutdown() {
        await Promise.allSettled([this.otlpExporter.shutdown(), this.metricExporter.shutdown(), this.meterProvider.shutdown(), this.provider.shutdown()])
    }
}
