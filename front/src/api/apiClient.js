// APIクライアント: バックエンドAPIとの通信を担当

// 環境変数からAPIのベースURLを取得。未設定の場合は開発用のローカルURLまたは相対パスをフォールバックとして使用。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'; // Viteの場合

/**
 * APIリクエストの共通オプションを設定するヘルパー関数
 * @param {object} options - fetchのオプション
 * @param {string} [method='GET'] - HTTPメソッド
 * @param {object} [body=null] - リクエストボディ (POST, PUTなどで使用)
 * @returns {object} - 設定済みのfetchオプション
 */
const buildOptions = (options = {}, method = 'GET', body = null) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // TODO: 必要に応じて認証トークンなどをヘッダーに追加
    // 'Authorization': `Bearer ${getToken()}`,
  };

  const fetchOptions = {
    method,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options, // その他のオプション (credentialsなど)
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  return fetchOptions;
};

/**
 * APIレスポンスを処理するヘルパー関数
 * @param {Response} response - fetchのレスポンスオブジェクト
 * @returns {Promise<object>} - パースされたJSONデータ
 * @throws {Error} - APIエラーが発生した場合
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // エラーレスポンスの場合、詳細情報を取得試行
     let errorData;
     try {
       errorData = await response.json();
     } catch (e) {
       // JSONパース失敗
       console.error('API Response JSON Parse Error in handleResponse:', e); // エラーeをログ出力
       errorData = { message: response.statusText };
     }
    console.error('API Error:', response.status, errorData);
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // 204 No Content のようなボディがない成功レスポンスを考慮
  if (response.status === 204) {
    return null;
  }

  // 成功レスポンスのJSONをパースして返す
  try {
    return await response.json();
  } catch (error) {
    console.error('API Response JSON Parse Error:', error);
    throw new Error('Failed to parse API response');
  }
};

/**
 * GETリクエストを実行
 * @param {string} endpoint - APIエンドポイント (ベースURL以降)
 * @param {object} [options={}] - fetchの追加オプション
 * @returns {Promise<object>} - APIからのレスポンスデータ
 */
const get = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = buildOptions(options, 'GET');
  console.log(`API GET: ${url}`, fetchOptions); // デバッグ用ログ
  const response = await fetch(url, fetchOptions);
  return handleResponse(response);
};

/**
 * POSTリクエストを実行
 * @param {string} endpoint - APIエンドポイント
 * @param {object} body - リクエストボディ
 * @param {object} [options={}] - fetchの追加オプション
 * @returns {Promise<object>} - APIからのレスポンスデータ
 */
const post = async (endpoint, body, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = buildOptions(options, 'POST', body);
  console.log(`API POST: ${url}`, fetchOptions); // デバッグ用ログ
  const response = await fetch(url, fetchOptions);
  return handleResponse(response);
};

/**
 * PUTリクエストを実行
 * @param {string} endpoint - APIエンドポイント
 * @param {object} body - リクエストボディ
 * @param {object} [options={}] - fetchの追加オプション
 * @returns {Promise<object>} - APIからのレスポンスデータ
 */
const put = async (endpoint, body, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = buildOptions(options, 'PUT', body);
  console.log(`API PUT: ${url}`, fetchOptions); // デバッグ用ログ
  const response = await fetch(url, fetchOptions);
  return handleResponse(response);
};

/**
 * DELETEリクエストを実行
 * @param {string} endpoint - APIエンドポイント
 * @param {object} [options={}] - fetchの追加オプション
 * @returns {Promise<object>} - APIからのレスポンスデータ (通常はnullか成功メッセージ)
 */
const del = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = buildOptions(options, 'DELETE');
  console.log(`API DELETE: ${url}`, fetchOptions); // デバッグ用ログ
  const response = await fetch(url, fetchOptions);
  return handleResponse(response);
};


// apiClientオブジェクトとしてエクスポート
const apiClient = {
  get,
  post,
  put,
  delete: del, // deleteは予約語なので別名でエクスポート
};

export default apiClient;

// --- モックAPI関数 (WorkoutContextで使用) ---
/**
 * @description 種目リストを取得するモックAPI
 * @returns {Promise<Array<{id: string, name: string, group: string}>>}
 */
export const getExerciseTypesMock = async () => {
  console.log('MOCK API: getExerciseTypesMock called');
  // WorkoutContextのinitialExerciseTypes相当のデータを返す
  // 本来はAPIから取得するが、API完成まではフロントで定義済みのものを使用
  const mockData = [
    { id: 'ex001', name: 'ベンチプレス', group: '胸' },
    { id: 'ex002', name: 'インクラインダンベルプレス', group: '胸' },
    { id: 'ex003', name: 'ショルダープレス', group: '肩' },
    { id: 'ex004', name: 'サイドレイズ', group: '肩' },
    { id: 'ex005', name: 'アームカール', group: '腕' },
    { id: 'ex006', name: 'フレンチプレス', group: '腕' },
    { id: 'ex007', name: 'ラットプルダウン', group: '背中' },
    { id: 'ex008', name: 'デッドリフト', group: '背中' },
    { id: 'ex009', name: 'スクワット', group: '脚' }, // '下半身' -> '脚' に統一 (DBスキーマ案より)
    { id: 'ex010', name: 'レッグプレス', group: '脚' },
    { id: 'ex011', name: 'レッグエクステンション', group: '脚' },
    { id: 'ex012', name: 'レッグカール', group: '脚' },
    { id: 'ex013', name: 'アブドミナル', group: '腹筋' }, // 腹筋はスキーマ案にないが一旦残す
    { id: 'ex014', name: 'ダンベルプレス', group: '胸' },
    { id: 'ex015', name: 'チェストインクラインプレス', group: '胸' },
    { id: 'ex016', name: 'ラテラルレイズ', group: '肩' },
  ];
  return Promise.resolve(mockData);
};

/**
 * @description 保存されたトレーニング記録リストを取得するモックAPI
 * @returns {Promise<Array<object>>}
 */
export const getWorkoutsMock = async () => {
  console.log('MOCK API: getWorkoutsMock called');
  // 現状は空の配列を返すか、固定のサンプルデータを返す
  const mockWorkouts = [
    // { id: 'w001', date: '2024-05-01', exercises: [{ name: 'ベンチプレス', weight: 60, reps: 10, sets: 3 }] }
  ];
  return Promise.resolve(mockWorkouts);
};

/**
 * @description 新しいトレーニング記録を保存するモックAPI
 * @param {object} workoutData - 保存するワークアウトデータ
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const saveWorkoutMock = async (workoutData) => {
  console.log('MOCK API: saveWorkoutMock called with data:', workoutData);
  // 成功したと仮定して、送信されたデータをそのまま返す
  return Promise.resolve({ success: true, data: { ...workoutData, id: `mock_${Date.now()}` } });
};


// --- 使用例 ---
/*
import apiClient, { getExerciseTypesMock, getWorkoutsMock, saveWorkoutMock } from './apiClient';

// GETリクエスト
apiClient.get('/exercises')
  .then(data => console.log('Fetched exercises:', data))
  .catch(error => console.error('Error fetching exercises:', error));

// POSTリクエスト
const newWorkout = { date: '2024-01-01', exercises: [...] };
apiClient.post('/workouts', newWorkout)
  .then(data => console.log('Workout saved:', data))
  .catch(error => console.error('Error saving workout:', error));
*/