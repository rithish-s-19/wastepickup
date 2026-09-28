package com.waste.wastepickup.controller;

import com.waste.wastepickup.entity.PickupLog;
import com.waste.wastepickup.service.PickupLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pickups")
public class PickupLogController {

    private final PickupLogService pickupLogService;

    public PickupLogController(
            PickupLogService pickupLogService) {

        this.pickupLogService = pickupLogService;
    }

    @PostMapping("/household/{householdId}")
    public ResponseEntity<PickupLog> createPickup(
            @PathVariable Long householdId,
            @RequestBody PickupLog pickupLog) {

        return new ResponseEntity<>(
                pickupLogService.createPickup(
                        householdId,
                        pickupLog
                ),
                HttpStatus.CREATED
        );
    }

        @GetMapping
        public ResponseEntity<List<PickupLog>> getAllPickups() {
                return ResponseEntity.ok(pickupLogService.getAllPickups());
        }

    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<PickupLog>> getPickupsByHousehold(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                pickupLogService.getPickupsByHousehold(
                        householdId
                )
        );
    }

    @GetMapping("/household/{householdId}/average")
    public ResponseEntity<Map<String, Object>> getHouseholdAverage(
            @PathVariable Long householdId) {

        double average =
                pickupLogService.getHouseholdAverage(
                        householdId
                );

        return ResponseEntity.ok(
                Map.of(
                        "householdId", householdId,
                        "rollingAverage", average
                )
        );
    }

    @GetMapping("/zone/{zoneId}/average")
    public ResponseEntity<Map<String, Object>> getZoneAverage(
            @PathVariable Long zoneId) {

        double average =
                pickupLogService.getZoneAverage(zoneId);

        return ResponseEntity.ok(
                Map.of(
                        "zoneId", zoneId,
                        "zoneAverage", average
                )
        );
    }
}