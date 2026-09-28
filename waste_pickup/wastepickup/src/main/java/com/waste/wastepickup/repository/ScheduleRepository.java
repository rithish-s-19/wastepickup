package com.waste.wastepickup.repository;

import com.waste.wastepickup.entity.Schedule;
import com.waste.wastepickup.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByZone(Zone zone);

    List<Schedule> findByZoneAndCollectionDay(
            Zone zone,
            DayOfWeek collectionDay);
}