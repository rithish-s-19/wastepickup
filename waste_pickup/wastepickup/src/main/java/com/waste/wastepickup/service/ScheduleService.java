package com.waste.wastepickup.service;

import com.waste.wastepickup.entity.Schedule;
import com.waste.wastepickup.entity.Zone;
import com.waste.wastepickup.repository.ScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final ZoneService zoneService;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            ZoneService zoneService) {

        this.scheduleRepository = scheduleRepository;
        this.zoneService = zoneService;
    }

    public Schedule createSchedule(
            Long zoneId,
            Schedule schedule) {

        Zone zone = zoneService.getZoneById(zoneId);

        if (schedule.getCollectionDay() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Collection day is required"
            );
        }

        if (schedule.getStartTime() == null ||
                schedule.getEndTime() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time and end time are required"
            );
        }

        if (!schedule.getStartTime().isBefore(schedule.getEndTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time"
            );
        }

        schedule.setZone(zone);

        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getSchedulesByZone(Long zoneId) {

        Zone zone = zoneService.getZoneById(zoneId);

        return scheduleRepository.findByZone(zone);
    }

    public boolean isPickupWindowOpen(Zone zone) {

        LocalDateTime now = LocalDateTime.now();

        DayOfWeek currentDay = now.getDayOfWeek();
        LocalTime currentTime = now.toLocalTime();

        List<Schedule> schedules =
                scheduleRepository.findByZoneAndCollectionDay(
                        zone,
                        currentDay
                );

        for (Schedule schedule : schedules) {

            boolean afterStart =
                    !currentTime.isBefore(schedule.getStartTime());

            boolean beforeEnd =
                    !currentTime.isAfter(schedule.getEndTime());

            if (afterStart && beforeEnd) {
                return true;
            }
        }

        return false;
    }
}