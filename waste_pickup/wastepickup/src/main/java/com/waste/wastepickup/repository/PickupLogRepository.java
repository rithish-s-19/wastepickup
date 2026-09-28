package com.waste.wastepickup.repository;

import com.waste.wastepickup.entity.Household;
import com.waste.wastepickup.entity.PickupLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupLogRepository extends JpaRepository<PickupLog, Long> {

    List<PickupLog> findAllByOrderByPickupTimeDesc();

    List<PickupLog> findByHouseholdOrderByPickupTimeDesc(
            Household household);

    List<PickupLog> findByHousehold_Zone_Id(Long zoneId);
}