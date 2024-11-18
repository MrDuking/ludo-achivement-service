import { Inject, Injectable } from "@nestjs/common"
import { Counter, Histogram } from "@opentelemetry/api"
import { MonitorService } from "../monitor/monitor.service"

@Injectable()
export class MetricsService {
    constructor(@Inject(MonitorService) private readonly monitorService: MonitorService) {}

    createCounter(name: string, description = "Counter description"): Counter {
        const meter = this.monitorService.getMeter("metrics-counter")
        return meter.createCounter(name, {
            description
        })
    }

    createHistogram(name: string, description = "Histogram description"): Histogram {
        const meter = this.monitorService.getMeter("metrics-histogram")
        return meter.createHistogram(name, {
            description
        })
    }
}
