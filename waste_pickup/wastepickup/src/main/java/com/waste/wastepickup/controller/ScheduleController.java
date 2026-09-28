package com.waste.wastepickup.controller;

import com.waste.wastepickup.entity.Schedule;
import com.waste.wastepickup.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping("/zone/{zoneId}")
    public ResponseEntity<Schedule> createSchedule(
            @PathVariable Long zoneId,
            @RequestBody Schedule schedule) {

        return new ResponseEntity<>(
                scheduleService.createSchedule(zoneId, schedule),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<Schedule>> getSchedulesByZone(
            @PathVariable Long zoneId) {

        return ResponseEntity.ok(
                scheduleService.getSchedulesByZone(zoneId)
        );
    }
}