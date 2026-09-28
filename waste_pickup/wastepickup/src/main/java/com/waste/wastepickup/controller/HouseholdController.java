package com.waste.wastepickup.controller;

import com.waste.wastepickup.entity.Household;
import com.waste.wastepickup.service.HouseholdService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(
            HouseholdService householdService) {

        this.householdService = householdService;
    }

    @PostMapping("/zone/{zoneId}")
    public ResponseEntity<Household> createHousehold(
            @PathVariable Long zoneId,
            @RequestBody Household household) {

        return new ResponseEntity<>(
                householdService.createHousehold(
                        zoneId,
                        household
                ),
                HttpStatus.CREATED
        );
    }

        @GetMapping
        public ResponseEntity<List<Household>> getAllHouseholds() {
                return ResponseEntity.ok(householdService.getAllHouseholds());
        }

    @GetMapping("/zone/{zoneId}")
    public ResponseEntity<List<Household>> getHouseholdsByZone(
            @PathVariable Long zoneId) {

        return ResponseEntity.ok(
                householdService.getHouseholdsByZone(zoneId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Household> getHouseholdById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                householdService.getHouseholdById(id)
        );
    }
}