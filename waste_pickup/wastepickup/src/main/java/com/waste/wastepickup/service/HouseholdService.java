package com.waste.wastepickup.service;

import com.waste.wastepickup.entity.Household;
import com.waste.wastepickup.entity.Zone;
import com.waste.wastepickup.repository.HouseholdRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final ZoneService zoneService;

    public HouseholdService(
            HouseholdRepository householdRepository,
            ZoneService zoneService) {

        this.householdRepository = householdRepository;
        this.zoneService = zoneService;
    }

    public Household createHousehold(
            Long zoneId,
            Household household) {

        Zone zone = zoneService.getZoneById(zoneId);

        if (household.getName() == null ||
                household.getName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Household name is required"
            );
        }

        if (household.getAddress() == null ||
                household.getAddress().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Household address is required"
            );
        }

        household.setZone(zone);
        household.setFlagged(false);

        return householdRepository.save(household);
    }

    public List<Household> getHouseholdsByZone(Long zoneId) {

        Zone zone = zoneService.getZoneById(zoneId);

        return householdRepository.findByZone(zone);
    }

    public List<Household> getAllHouseholds() {
        return householdRepository.findAll();
    }

    public Household getHouseholdById(Long id) {

        return householdRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Household not found"
                        )
                );
    }

    public Household saveHousehold(Household household) {
        return householdRepository.save(household);
    }
}