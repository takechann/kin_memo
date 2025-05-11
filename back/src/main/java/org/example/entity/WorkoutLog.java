package org.example.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "workout_logs")
public class WorkoutLog extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long log_id;

    @NotNull(message = "ユーザーIDは必須です")
    public Integer user_id;

    @NotNull(message = "トレーニング日は必須です")
    public LocalDate workout_date;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    @NotNull(message = "種目IDは必須です")
    public Exercise exercise;

    public Double weight;

    public Integer repetitions;

    public Double rm;
}