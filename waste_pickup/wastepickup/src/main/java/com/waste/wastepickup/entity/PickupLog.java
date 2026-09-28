package com.waste.wastepickup.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_logs")
public class PickupLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @Column(nullable = false)
    private LocalDateTime pickupTime;

    @Column(nullable = false)
    private Integer segregationScore;

    public PickupLog() {
    }

    public PickupLog(
            Household household,
            LocalDateTime pickupTime,
            Integer segregationScore) {

        this.household = household;
        this.pickupTime = pickupTime;
        this.segregationScore = segregationScore;
    }

    public Long getId() {
        return id;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public LocalDateTime getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(LocalDateTime pickupTime) {
        this.pickupTime = pickupTime;
    }

    public Integer getSegregationScore() {
        return segregationScore;
    }

    public void setSegregationScore(Integer segregationScore) {
        this.segregationScore = segregationScore;
    }
}