package com.waste.wastepickup.service;

import com.waste.wastepickup.entity.Household;
import com.waste.wastepickup.entity.PickupLog;
import com.waste.wastepickup.entity.Zone;
import com.waste.wastepickup.repository.PickupLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PickupLogService {

    private final PickupLogRepository pickupLogRepository;
    private final HouseholdService householdService;
    private final ScheduleService scheduleService;

    @Value("${app.segregation.minimum-score:50}")
    private double minimumScore;

    @Value("${app.segregation.rolling-window:5}")
    private int rollingWindow;

    public PickupLogService(
            PickupLogRepository pickupLogRepository,
            HouseholdService householdService,
            ScheduleService scheduleService) {

        this.pickupLogRepository = pickupLogRepository;
        this.householdService = householdService;
        this.scheduleService = scheduleService;
    }

    public PickupLog createPickup(
            Long householdId,
            PickupLog pickupLog) {

        Household household =
                householdService.getHouseholdById(householdId);

        if (pickupLog.getSegregationScore() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Segregation score is required"
            );
        }

        if (pickupLog.getSegregationScore() < 0 ||
                pickupLog.getSegregationScore() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Segregation score must be between 0 and 100"
            );
        }

        Zone zone = household.getZone();

        if (!scheduleService.isPickupWindowOpen(zone)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Pickup cannot be recorded outside the scheduled pickup window"
            );
        }

        pickupLog.setHousehold(household);

        if (pickupLog.getPickupTime() == null) {
            pickupLog.setPickupTime(LocalDateTime.now());
        }

        PickupLog savedLog = pickupLogRepository.save(pickupLog);

        updateHouseholdFlag(household);

        return savedLog;
    }

    public List<PickupLog> getPickupsByHousehold(
            Long householdId) {

        Household household =
                householdService.getHouseholdById(householdId);

        return pickupLogRepository
                .findByHouseholdOrderByPickupTimeDesc(household);
    }

    public List<PickupLog> getAllPickups() {
        return pickupLogRepository.findAllByOrderByPickupTimeDesc();
    }

    public double getHouseholdAverage(Long householdId) {

        Household household =
                householdService.getHouseholdById(householdId);

        List<PickupLog> logs =
                pickupLogRepository
                        .findByHouseholdOrderByPickupTimeDesc(household);

        return calculateRollingAverage(logs);
    }

    public double getZoneAverage(Long zoneId) {

        List<PickupLog> logs =
                pickupLogRepository.findByHousehold_Zone_Id(zoneId);

        if (logs.isEmpty()) {
            return 0.0;
        }

        double total = 0;

        for (PickupLog log : logs) {
            total += log.getSegregationScore();
        }

        return total / logs.size();
    }

    private double calculateRollingAverage(
            List<PickupLog> logs) {

        if (logs.isEmpty()) {
            return 0.0;
        }

        int count = Math.min(
                rollingWindow,
                logs.size()
        );

        double total = 0;

        for (int i = 0; i < count; i++) {
            total += logs.get(i).getSegregationScore();
        }

        return total / count;
    }

    private void updateHouseholdFlag(
            Household household) {

        List<PickupLog> logs =
                pickupLogRepository
                        .findByHouseholdOrderByPickupTimeDesc(household);

        double average =
                calculateRollingAverage(logs);

        household.setFlagged(
                average < minimumScore
        );

        householdService.saveHousehold(household);
    }
}