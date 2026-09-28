package com.waste.wastepickup.controller;

import com.waste.wastepickup.entity.Zone;
import com.waste.wastepickup.service.ZoneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @PostMapping
    public ResponseEntity<Zone> createZone(
            @RequestBody Zone zone) {

        return new ResponseEntity<>(
                zoneService.createZone(zone),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Zone>> getAllZones() {

        return ResponseEntity.ok(
                zoneService.getAllZones()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Zone> getZoneById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                zoneService.getZoneById(id)
        );
    }
}