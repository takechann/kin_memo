import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

// TabPanel component for Material UI tabs
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
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    maxWeight: 0,
    maxReps: 0,
    maxSets: 0,
    totalWorkouts: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const lineColor = theme.palette.primary.main;
  const gridColor = theme.palette.divider;

  // Update selected exercise when exercise types are loaded
  useEffect(() => {
    if (exerciseTypes.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseTypes[0]);
    }
  }, [exerciseTypes, selectedExercise]);

  // Update chart data when selected exercise changes
  useEffect(() => {
    if (!selectedExercise) return;

    const workouts = getAllWorkouts();
    
    // Filter and format data for the selected exercise
    const filteredData = [];
    let maxWeight = 0;
    let maxReps = 0;
    let maxSets = 0;
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
      totalWorkouts: exerciseCount,
    });
  }, [selectedExercise, getAllWorkouts]);

  // Handle exercise selection change
  const handleExerciseChange = (e) => {
    setSelectedExercise(e.target.value);
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

        {/* Exercise Selection */}
        <FormControl fullWidth>
          <InputLabel id="exercise-select-label">種目を選択</InputLabel>
          <Select
            labelId="exercise-select-label"
            value={selectedExercise}
            onChange={handleExerciseChange}
            label="種目を選択"
            disabled={exerciseTypes.length === 0}
          >
            {exerciseTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Summary Stats */}
        {selectedExercise && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedExercise} の記録
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      最大重量
                    </Typography>
                    <Typography variant="h6">
                      {summary.maxWeight} kg
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      最大回数
                    </Typography>
                    <Typography variant="h6">
                      {summary.maxReps} 回
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6} sm={3}>
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
        {selectedExercise && chartData.length > 0 ? (
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
        ) : selectedExercise ? (
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
              {selectedExercise} のトレーニング記録がありません
            </Typography>
          </Paper>
        ) : null}
      </Stack>
    </Container>
  );
};

export default StatsPage;