

import com.google.cloud.firestore.annotation.DocumentId;

// Firestore Client API では、@Entity または PanacheEntityBase は必要ありません。
public class InitializationFlag {

    @DocumentId // ドキュメント ID には Firestore アノテーションを使用
    public String flagId; // フィールド名は Firestore ドキュメント ID と一致

    // フィールド名は Firestore フィールド名と一致。一意性はロジックによって処理されます。
    public String flagName;

    public boolean initialized;

    // Firestore のデシリアライゼーションにはデフォルトコンストラクタが必要。
    public InitializationFlag() {
    }

    public InitializationFlag(String flagName) {
        this.flagName = flagName;
        this.initialized = false; // Default to false when created
    }

    // オプション: 必要に応じて getter と setter を追加します
}