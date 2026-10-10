package com.horror.h5.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "achievements")
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "achievement_code", unique = true, nullable = false, length = 32)
    public String achievementCode;

    @Column(name = "name", nullable = false, length = 64)
    public String name;

    @Column(name = "description", length = 256)
    public String description;

    @Column(name = "icon", length = 32)
    public String icon;

    @Column(name = "rarity", length = 16)
    public String rarity; // common, rare, epic, legendary

    @Column(name = "secret")
    public Boolean secret = false;

    @Column(name = "unlock_hint", length = 128)
    public String unlockHint;
}
