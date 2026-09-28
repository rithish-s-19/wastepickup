package com.waste.wastepickup.repository;

import com.waste.wastepickup.entity.Household;
import com.waste.wastepickup.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByZone(Zone zone);
}