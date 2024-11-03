import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PAGE_SIZE = 100;
const exercises = [];

async function fetchExercises(page: number) {
  return axios.get(`https://api.hevyapp.com/v1/exercise_templates`, {
    params: {
      page,
      pageSize: PAGE_SIZE
    },
    headers: {
      'Accept': 'application/json',
      'api-key': process.env.HEVY_API_KEY as string
    }
  });
}

(async () => {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchExercises(page);
    if (response.status !== 200) break;

    const templates = response.data.exercise_templates;

    exercises.push(...templates);
    hasMore = templates.length === PAGE_SIZE;
    page++;
  }

  await fs.writeFile(
    path.resolve(__dirname, '../resources/hevy.exercises.json'),
    JSON.stringify(exercises, null, 2)
  );

  console.log(`Fetched ${exercises.length} exercises`);
})();
