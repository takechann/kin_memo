package org.example.entity;

import com.google.cloud.firestore.annotation.DocumentId;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Firestore Client API では、@Entity または PanacheEntityBase は必要ありません。
public class Exercise {

    @DocumentId // ドキュメント ID には Firestore アノテーションを使用。
    public String exercise_id; // フィールド名は Firestore ドキュメント ID と一致。

    @NotBlank(message = "種目名は必須です")
    public String name; // フィールド名は Firestore フィールド名と一致。

    @NotBlank(message = "部位は必須です")
    @Pattern(regexp = "腕|肩|胸|背中|脚", message = "部位は腕、肩、胸、背中、脚のいずれかで入力してください")
    public String body_part; // フィールド名は Firestore フィールド名と一致。

    // Firestore のデシリアライゼーションにはデフォルトコンストラクタが必要。
    public Exercise() {
    }

    public Exercise(String name, String body_part) {
        this.name = name;
        this.body_part = body_part;
    }

    // オプション: 必要に応じて getter と setter を追加できます。ただし、パブリックフィールドは Firestore で動作します。
}