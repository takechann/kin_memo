import { createContext, useState, useContext, useEffect } from 'react';
// apiClientからモック関数をインポート
// eslint-disable-next-line no-unused-vars
import { getExerciseTypesMock, getWorkoutsMock, saveWorkoutMock } from '../api/apiClient';

// initialExerciseTypes は apiClient の getExerciseTypesMock が返すデータと重複するため、ここでは定義しない
// コンテキストの作成
const WorkoutContext = createContext();

// コンテキストを使用するためのカスタムフック
export const useWorkout = () => {
  return useContext(WorkoutContext);
};

export const WorkoutProvider = ({ children }) => {
  // トレーニング記録の状態
  const [workouts, setWorkouts] = useState([]);
  // 種目リストの状態 (オブジェクト配列に変更)
  const [exerciseTypes, setExerciseTypes] = useState([]);
  // ローディング状態
  const [loading, setLoading] = useState(true);

  // 初回レンダリング時にAPIモックからデータを読み込む
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // console.log('APIモック呼び出し: getWorkoutsMock');
        // const fetchedWorkouts = await getWorkoutsMock();
        // setWorkouts(fetchedWorkouts);
        // console.log('APIモック呼び出し完了: getWorkoutsMock', fetchedWorkouts);

        // console.log('APIモック呼び出し: getExerciseTypesMock');
        // const fetchedExerciseTypes = await getExerciseTypesMock();
        // setExerciseTypes(fetchedExerciseTypes);
        // console.log('APIモック呼び出し完了: getExerciseTypesMock', fetchedExerciseTypes);
        
        // API完成まではフロントで定義したモックデータを直接使用する
        // （ユーザー指示：APIがまだできていないので、暫定的に画面側でマスタを保持）
        const exerciseTypesData = await getExerciseTypesMock(); // apiClientから取得
        setExerciseTypes(exerciseTypesData);

        const workoutsData = await getWorkoutsMock(); // apiClientから取得
        setWorkouts(workoutsData);

      } catch (error) {
        console.error('APIモックからのデータ読み込みエラー:', error);
        // エラー時は空の配列やデフォルト値を設定することも検討
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // 初回のみ実行

  // 新しいトレーニング記録を追加する関数
  const addWorkout = async (workout) => { // asyncに変更
    // IDとタイムスタンプを追加 (IDはAPI側で採番される想定なので削除)
    const newWorkout = {
      ...workout,
      // id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
    };

    // console.log('APIモック呼び出し: saveWorkoutMock', newWorkout);
    // const savedWorkout = await saveWorkoutMock(newWorkout);
    // console.log('APIモック呼び出し完了: saveWorkoutMock', savedWorkout);
    // if (savedWorkout && savedWorkout.success) {
    //   setWorkouts((prevWorkouts) => [...prevWorkouts, savedWorkout.data]);
    //   return savedWorkout.data;
    // }
    // return null;

    // APIモック呼び出しをコメントアウトし、ローカルで状態を更新する（UI確認用）
    const mockSavedWorkout = { ...newWorkout, id: `temp_workout_${Date.now()}`}; // UI確認用に仮ID付与
    setWorkouts((prevWorkouts) => [...prevWorkouts, mockSavedWorkout]);
    console.log('ローカルでワークアウト追加 (APIモックはコメントアウト中):', mockSavedWorkout);
    return mockSavedWorkout;

    // 自由入力不可になったため、新しい種目をexerciseTypesに追加するロジックは削除済み
  };

  // 特定の日付のワークアウトを取得する関数 (変更なし)
  const getWorkoutsByDate = (date) => {
    return workouts.filter((workout) => workout.date === date);
  };

  // 全てのワークアウトを取得する関数
  const getAllWorkouts = () => {
    return workouts;
  };

  // ワークアウトが存在する全ての日付を取得する関数 (降順ソート)
  const getWorkoutDates = () => {
    const dates = workouts.map((workout) => workout.date);
    return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  };

  // コンテキストが提供する値
  const value = {
    workouts,
    exerciseTypes, // オブジェクト配列になった
    loading,
    addWorkout, // 新規種目追加ロジックを更新
    getWorkoutsByDate,
    getAllWorkouts,
    getWorkoutDates,
    // addNewExerciseType, // 必要であれば追加する関数
  };

  return (
    // コンテキストプロバイダーでラップ
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};