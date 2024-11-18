import { Module } from "@nestjs/common"
import { MonitorModule } from "../monitor/monitor.module"
import { MetricsService } from "./metrics.service"

@Module({
    imports: [MonitorModule],
    providers: [MetricsService],
    exports: [MetricsService]
})
export class MetricsModule {}
