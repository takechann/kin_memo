package org.example.entity;

import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.firestore.annotation.Exclude; // Import Exclude annotation
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

// Firestore Client API では、@Entity または PanacheEntityBase は必要ありません。
public class WorkoutLog {

    @DocumentId // ドキュメント ID には Firestore アノテーションを使用
    public String log_id; // フィールド名は Firestore ドキュメント ID と一致

    @NotNull(message = "ユーザーIDは必須です")
    public String user_id;

    @NotNull(message = "トレーニング日は必須です")
    public String workout_date;

    // 運動 ID のみを文字列参照として保存します
    @NotNull(message = "種目IDは必須です")
    public String exerciseId; // Renamed from exerciseId to match Firestore field

    // Exercise オブジェクト自体が直接永続化されるのを防ぎます
    // 必要に応じて個別にロードされます
    @Exclude
    public Exercise exercise;

    public Double weight;

    public Integer repetitions;

    public Double rm;

    // Firestore のデシリアライゼーションにはデフォルトコンストラクタが必要
    public WorkoutLog() {
    }

    // オプション: 必要に応じて getter と setter を追加します
}