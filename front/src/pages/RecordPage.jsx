import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { useWorkout } from '../context/WorkoutContext';

const RecordPage = () => {
  const { addWorkout, exerciseTypes } = useWorkout();
  
  // State for the form
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exercises, setExercises] = useState([
    { name: '', weight: '', reps: '', sets: '' }
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add a new exercise entry
  const addExercise = () => {
    setExercises([...exercises, { name: '', weight: '', reps: '', sets: '' }]);
  };

  // Remove an exercise entry
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

  // Update an exercise entry
  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const isValid = exercises.every(
      (ex) => ex.name && ex.weight && ex.reps && ex.sets
    );
    
    if (!isValid) {
      setSnackbar({
        open: true,
        message: '全ての項目を入力してください',
        severity: 'error'
      });
      return;
    }
    
    // Create workout record
    const workout = {
      date,
      exercises: exercises.map(ex => ({
        name: ex.name,
        weight: parseFloat(ex.weight),
        reps: parseInt(ex.reps, 10),
        sets: parseInt(ex.sets, 10),
      })),
    };
    
    // Add workout to context
    addWorkout(workout);
    
    // Reset form
    setExercises([{ name: '', weight: '', reps: '', sets: '' }]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'トレーニングを記録しました',
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
                    {/* Exercise Type */}
                    <TextField
                      select
                      label="種目名"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      required
                      fullWidth
                    >
                      <MenuItem value="">種目を選択</MenuItem>
                      {exerciseTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                    
                    <Grid container spacing={2}>
                      {/* Weight */}
                      <Grid item xs={4}>
                        <TextField
                          label="重量 (kg)"
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 0, step: 0.5 }}
                        />
                      </Grid>
                      
                      {/* Reps */}
                      <Grid item xs={4}>
                        <TextField
                          label="回数"
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      
                      {/* Sets */}
                      <Grid item xs={4}>
                        <TextField
                          label="セット数"
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                          required
                          fullWidth
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                    </Grid>
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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