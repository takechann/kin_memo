package org.example.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "exercises")
public class Exercise extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long exercise_id;

    @NotBlank(message = "種目名は必須です")
    public String name;

    @NotBlank(message = "部位は必須です")
    @Pattern(regexp = "腕|肩|胸|背中|脚", message = "部位は腕、肩、胸、背中、脚のいずれかで入力してください")
    public String body_part;
}