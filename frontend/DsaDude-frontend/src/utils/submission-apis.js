import { api } from "./api";

// for getting user stats.
// Response format : 
// {
//   data: {
//     totalSubmissions: 42,
//     solvedCount: 15,
//     easySolvedCount: 8,
//     mediumSolvedCount: 5,
//     hardSolvedCount: 2
//   },
//   status: 200,
//   statusText: "OK",
//   headers: { ... },
//   config: { ... }
// }

export const user_submissions_stats = async () => {
  return await api.get("/user/stats");
};

export const increment_submission_count = async (userId) => {
  return await api.put(`/user/${userId}/increment-submissions`);
};

export const increment_solved_count = async (userId, difficulty) => {
  return await api.put(`/user/${userId}/increment-solved?difficulty=${difficulty}`);
};