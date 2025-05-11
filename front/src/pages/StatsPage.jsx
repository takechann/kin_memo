import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Card,
  CardContent,
  Grid,
  Paper,
  Tabs,
  Tab,
  Stack,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useWorkout } from '../context/WorkoutContext';

// Material UI タブ用のタブパネルコンポーネント
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StatsPage = () => {
  const { getAllWorkouts, exerciseTypes } = useWorkout();
  const [displayMode, setDisplayMode] = useState('exercise'); // 'all' または 'exercise'
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    maxWeight: 0,
    maxReps: 0,
    maxSets: 0,
    maxRM: 0,
    totalWorkouts: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const [allChartData, setAllChartData] = useState([]);

  const lineColor = theme.palette.primary.main;
  const gridColor = theme.palette.divider;

  // exerciseTypesが読み込まれたら、選択中の種目を初期化
  useEffect(() => {
    // exerciseTypesがオブジェクトの配列になったため、nameプロパティを使用
    // exerciseTypesがオブジェクトの配列になったため、nameプロパティを使用
    if (exerciseTypes.length > 0 && !selectedExercise && displayMode === 'exercise') {
      setSelectedExercise(exerciseTypes[0]); // 最初の種目オブジェクトを設定
    }
  }, [exerciseTypes, selectedExercise, displayMode]);

  // 選択中の種目が変更されたらチャートデータを更新 (各種目モード)
  useEffect(() => {
    if (displayMode !== 'exercise') return;
    if (!selectedExercise) return;

    const workouts = getAllWorkouts();
    
    // Filter and format data for the selected exercise
    const filteredData = [];
    let maxWeight = 0;
    let maxReps = 0;
    let maxSets = 0;
    let maxRM = 0;
    let exerciseCount = 0;

    workouts.forEach(workout => {
      const matchingExercises = workout.exercises.filter(
        ex => ex.name === selectedExercise
      );

      if (matchingExercises.length > 0) {
        exerciseCount++;
        
        matchingExercises.forEach(ex => {
          // Update max values
          maxWeight = Math.max(maxWeight, ex.weight);
          maxReps = Math.max(maxReps, ex.reps);
          maxSets = Math.max(maxSets, ex.sets);
          maxRM = Math.max(maxRM, calculateRM(ex.weight, ex.reps));

          // Add data point
          filteredData.push({
            date: workout.date,
            weight: ex.weight,
            reps: ex.reps,
            sets: ex.sets,
          });
        });
      }
    });

    // Sort by date
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Format dates for display
    const formattedData = filteredData.map(item => ({
      ...item,
      formattedDate: format(new Date(item.date), 'MM/dd'),
    }));

    setChartData(formattedData);
    setSummary({
      maxWeight,
      maxReps,
      maxSets,
      maxRM,
      totalWorkouts: exerciseCount,
    });
  }, [selectedExercise, getAllWorkouts, displayMode]);

  // ALLモードのチャートデータを更新
  useEffect(() => {
    if (displayMode !== 'all') return;

    const workouts = getAllWorkouts();
    const groupedData = {};

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const { name, weight, reps, sets } = exercise;
        const date = format(new Date(workout.date), 'MM/dd');

        if (!groupedData[name]) {
          groupedData[name] = [];
        }

        groupedData[name].push({
          date,
          weight,
          reps,
          sets,
        });
      });
    });

    // rechartsで表示できる形式に変換
    const chartData = Object.entries(groupedData).map(([name, data]) => ({
      name,
      data: data.map(item => ({
        date: item.date,
        weight: item.weight,
        reps: item.reps,
        sets: item.sets,
      })),
    }));

    setAllChartData(chartData);
  }, [getAllWorkouts, displayMode]);

  // Handle exercise selection change
  const handleExerciseChange = (newValue) => {
    // newValueがオブジェクトの場合はそのままセット、文字列の場合はオブジェクトを検索してセットするか、あるいは文字列のまま扱うかを検討
    // ここでは Autocomplete の挙動に合わせて newValue をそのままセットする
    setSelectedExercise(newValue);
  };

  // RMを計算する関数
  const calculateRM = (weight, reps) => {
    if (!weight || !reps) return 0;
    // Brzyckiの公式を使用 (RM = weight * (36 / (37 - reps)))
    const rm = weight * (36 / (37 - reps));
    return Math.round(rm);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1" align="center">
          トレーニング確認
        </Typography>
        {/* Display Mode Selection */}
        <FormControl fullWidth>
          <InputLabel id="display-mode-select-label">表示モードを選択</InputLabel>
          <Select
            labelId="display-mode-select-label"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value)}
            label="表示モードを選択"
          >
            <MenuItem value="all">ALL</MenuItem>
            <MenuItem value="exercise">各種目</MenuItem>
          </Select>
        </FormControl>

        {/* Exercise Selection */}
        {displayMode === 'exercise' && exerciseTypes && (
          <Autocomplete
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
            value={selectedExercise} // selectedExercise はオブジェクトまたはnullを期待
            onChange={(event, newValue) => {
              // newValue は選択されたオプションオブジェクト、または入力された文字列
              handleExerciseChange(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="種目名"
                required
                fullWidth
              />
            )}
          />
        )}

        {/* Summary Stats */}
        {displayMode === 'exercise' && selectedExercise && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedExercise?.name || selectedExercise || ''} の記録
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={4} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      最大重量
                    </Typography>
                    <Typography variant="h6">
                      {summary.maxWeight} kg
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      最大回数
                    </Typography>
                    <Typography variant="h6">
                      {summary.maxReps} 回
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      最大RM
                    </Typography>
                    <Typography variant="h6">
                      {summary.maxRM} kg
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      最大セット数
                    </Typography>
                    <Typography variant="h6">
                      {summary.maxSets} セット
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      トレーニング回数
                    </Typography>
                    <Typography variant="h6">
                      {summary.totalWorkouts} 回
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {/* displayMode === 'exercise' のグラフ表示は後続のブロックでまとめて処理するため、ここは削除またはコメントアウト */}
        {/* {displayMode === 'exercise' && selectedExercise && chartData.length > 0 ? (
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  centered
                >
                  <Tab label="重量" />
                  <Tab label="回数" />
                  <Tab label="セット数" />
                </Tabs>
              </Box>
            </CardContent>
          </Card>
        ) : displayMode === 'exercise' && selectedExercise && chartData.length === 0 ? ( // chartData.length === 0 を追加
          <Paper
            sx={{
              p: 4,
              height: 300,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography color="text.secondary">
              {selectedExercise?.name || selectedExercise || ''} のトレーニング記録がありません
            </Typography>
          </Paper>
        ) : null} */}

        {displayMode === 'all' && allChartData.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                すべての種目の記録
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {allChartData.map((exercise, index) => (
                      <Line
                        key={index}
                        data={exercise.data}
                        type="monotone"
                        dataKey="weight"
                        stroke={theme.palette.primary[index % 5 === 0 ? 'main' : index % 5 === 1 ? 'dark' : index % 5 === 2 ? 'light' : index % 5 === 3 ? 'contrastText' : 'main']}
                        name={exercise.name}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}

        {displayMode === 'exercise' && selectedExercise ? (
          chartData.length > 0 ? (
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    centered
                  >
                    <Tab label="重量" />
                    <Tab label="回数" />
                    <Tab label="セット数" />
                  </Tabs>
                </Box>

                {/* Weight Chart */}
                <TabPanel value={tabValue} index={0}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="formattedDate" />
                      <YAxis unit=" kg" />
                      <Tooltip 
                        formatter={(value) => [`${value} kg`, '重量']}
                        labelFormatter={(label) => `日付: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke={lineColor}
                        name="重量"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </TabPanel>
              
              {/* Reps Chart */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="formattedDate" />
                      <YAxis unit=" 回" />
                      <Tooltip 
                        formatter={(value) => [`${value} 回`, '回数']}
                        labelFormatter={(label) => `日付: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="reps"
                        stroke={lineColor}
                        name="回数"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </TabPanel>
              
              {/* Sets Chart */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="formattedDate" />
                      <YAxis unit=" セット" />
                      <Tooltip 
                        formatter={(value) => [`${value} セット`, 'セット数']}
                        labelFormatter={(label) => `日付: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sets"
                        stroke={lineColor}
                        name="セット数"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </TabPanel>
            </CardContent>
            </Card>
          ) : (
            <Paper
              sx={{
                p: 4,
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography color="text.secondary">
                {selectedExercise?.name || selectedExercise || ''} のトレーニング記録がありません
              </Typography>
            </Paper>
          )
        ) : null}
      </Stack>
    </Container>
  );
};

export default StatsPage;