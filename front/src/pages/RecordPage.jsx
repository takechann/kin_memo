import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  TextField,
  // MenuItem, // Autocompleteを使用するため不要に
  Card,
  CardContent,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  Autocomplete, // Autocompleteをインポート
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { useWorkout } from '../context/WorkoutContext';

const RecordPage = () => {
  const { addWorkout, exerciseTypes } = useWorkout(); // exerciseTypesは {id, name, group}[] になっている想定

  // フォームの状態
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  // exercisesの状態 - repsとsetsにデフォルト値を設定
  const initialExerciseState = { name: null, weight: '', reps: '10', sets: '3' }; // nameはnull初期化 (Autocomplete用)
  const [exercises, setExercises] = useState([initialExerciseState]);
  const [unit, setUnit] = useState('kg'); // 'kg' または 'lbs'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // 新しい種目入力欄を追加する関数 - デフォルト値を使用
  const addExercise = () => {
    setExercises([...exercises, { ...initialExerciseState }]);
  };

  // 種目入力欄を削除する関数
  const removeExercise = (index) => {
    if (exercises.length === 1) {
      setSnackbar({
        open: true,
        message: '最低1つの種目が必要です',
        severity: 'warning'
      });
      return;
    }
    
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  // 種目入力欄の値を更新する関数 (Autocomplete対応)
  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    // Autocompleteからの値はオブジェクトの場合と文字列の場合がある
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  // フォーム送信時の処理
  const handleSubmit = (e) => {
    e.preventDefault();

    // バリデーション: nameはオブジェクトか文字列か確認
    const isValid = exercises.every(
      (ex) => ex.name && // nameがnullや空でないか
               (typeof ex.name === 'string' || typeof ex.name?.name === 'string') && // 文字列かオブジェクトのnameプロパティがあるか
               ex.weight && ex.reps && ex.sets
    );

    if (!isValid) {
      setSnackbar({
        open: true,
        message: '全ての項目を入力してください',
        severity: 'error'
      });
      return;
    }

    // ワークアウト記録オブジェクトを作成
    const workout = {
      date,
      exercises: exercises.map(ex => {
        // nameがオブジェクトの場合はnameプロパティを、文字列の場合はそのまま使用
        const exerciseName = typeof ex.name === 'string' ? ex.name : ex.name?.name;
        return {
          name: exerciseName, // 必ず文字列にする
          weight: parseFloat(ex.weight) || 0, // 数値に変換、失敗したら0
          reps: parseInt(ex.reps, 10) || 0, // 数値に変換、失敗したら0
          sets: parseInt(ex.sets, 10) || 0, // 数値に変換、失敗したら0
        };
      }),
    };

    // コンテキストにワークアウトを追加 (ここでContext内のAPIコメントが活きる)
    // トレーニング記録保存 (Context経由)
    addWorkout(workout);

    // フォームをリセット (デフォルト値で)
    setExercises([{ ...initialExerciseState }]);

    // 成功メッセージを表示
    setSnackbar({
      open: true,
      message: 'トレーニングを記録しました',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // RMを計算する関数
  const calculateRM = (weight, reps) => {
    if (!weight || !reps) return 0;
    // Brzyckiの公式を使用 (RM = weight * (36 / (37 - reps)))
    const rm = weight * (36 / (37 - reps));
    return Math.round(rm);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1" align="center">
          トレーニング記録
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Date Input */}
            <TextField
              label="日付"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            {/* Exercise Entries */}
            {exercises.map((exercise, index) => (
              <Card key={index} sx={{ position: 'relative' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    種目 {index + 1}
                  </Typography>

                  <Stack spacing={2}>
                    {/* 種目名 (Autocompleteに変更) */}
                    <Autocomplete
                      // freeSolo // 自由入力を不可にするため削除
                      options={exerciseTypes.sort((a, b) => -b.group.localeCompare(a.group))} // グループでソートして表示
                      groupBy={(option) => option.group} // グループ化
                      getOptionLabel={(option) => {
                        // オプションが文字列の場合 (自由入力時) はそのまま表示
                        if (typeof option === 'string') {
                          return option;
                        }
                        // オブジェクトの場合は name プロパティを表示
                        return option.name || "";
                      }}
                      value={exercise.name} // 現在の値 (オブジェクトまたは文字列)
                      onChange={(event, newValue) => {
                        updateExercise(index, 'name', newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="種目名"
                          required
                          fullWidth
                        />
                      )}
                      // オプション選択時にオブジェクト全体が newValue に入る
                      // 自由入力時は文字列が newValue に入る
                    />

                    <Grid container spacing={2}>
                      {/* 重量 */}
                      <Grid item xs={5}>
                        <TextField
                          label={`重量 (${unit})`}
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 0, step: 0.5 }} // 0.5刻み
                        />
                      </Grid>
                      <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{unit === 'kg' ? 'kg' : 'lbs'}</Typography>
                        <Switch
                          checked={unit === 'lbs'}
                          onChange={(e) => setUnit(e.target.checked ? 'lbs' : 'kg')}
                          inputProps={{ 'aria-label': '単位切り替え' }}
                        />
                      </Grid>

                      {/* 回数 (デフォルト値反映) */}
                      <Grid item xs={4}>
                        <TextField
                          label="回数"
                          type="number"
                          value={exercise.reps} // デフォルトは '10'
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 1 }}
                        />
                      </Grid>

                      {/* セット数 (デフォルト値反映) */}
                      <Grid item xs={4}>
                        <TextField
                          label="セット数"
                          type="number"
                          value={exercise.sets} // デフォルトは '3'
                          onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                    </Grid>
                    {/* RM表示 */}
                    <Typography variant="body2">
                      推定RM: {calculateRM(exercise.weight, exercise.reps)} {unit === 'kg' ? 'kg' : 'lbs'}
                    </Typography>
                  </Stack>
                  
                  {/* Remove Button */}
                  <IconButton
                    aria-label="種目を削除"
                    onClick={() => removeExercise(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Exercise Button */}
            <Button
              startIcon={<AddIcon />}
              onClick={addExercise}
              variant="outlined"
              color="primary"
            >
              種目を追加
            </Button>
            
            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              記録する
            </Button>
          </Stack>
        </Box>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RecordPage;