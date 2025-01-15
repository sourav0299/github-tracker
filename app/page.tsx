"use client";

import { useState, useEffect } from "react";

export default function CommitTracker() {
  const [yearlyTarget, setYearlyTarget] = useState<number>(0);
  const [totalCommits, setTotalCommits] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [goalCalculations, setGoalCalculations] = useState<string | null>(null);

  useEffect(() => {
    const savedTarget = localStorage.getItem("yearlyCommitTarget");
    if (savedTarget) {
      const parsedTarget = parseInt(savedTarget, 10);
      setYearlyTarget(parsedTarget);
      fetchCommits(parsedTarget);
    }
  }, []);

  const saveYearlyTarget = () => {
    localStorage.setItem("yearlyCommitTarget", yearlyTarget.toString());
    fetchCommits(yearlyTarget);
  };

  const fetchCommits = async (target: number) => {
    setResult("Fetching commits...");

    const startDate = "2025-01-01";
    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch(
        `/api/commits?since=${startDate}&until=${today}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch commit data");
      }
      const data = await response.json();
      setTotalCommits(data.totalCommits);
      calculateProgress(data.totalCommits, target);
    } catch (error) {
      console.error("Error fetching commits:", error);
      setResult("Failed to fetch commit data. Please try again.");
    }
  };

  const calculateProgress = (commits: number, target: number) => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const elapsedDays = Math.ceil(
      (today.getTime() - startOfYear.getTime()) / millisecondsPerDay
    );
    const remainingDays = Math.ceil(
      (endOfYear.getTime() - today.getTime()) / millisecondsPerDay
    );

    const expectedCommits = Math.round((target / 365) * elapsedDays);
    const difference = commits - expectedCommits;

    if (difference >= 0) {
      setResult(
        `You're ahead by ${difference} commits! Keep up the good work!`
      );
    } else {
      setResult(
        `You're behind by ${Math.abs(difference)} commits. Time to catch up!`
      );
    }

    const remainingCommits = target - commits;
    const dailyGoal = Math.ceil(remainingCommits / remainingDays);
    const weeklyGoal = Math.ceil(dailyGoal * 7);
    const monthlyGoal = Math.ceil(dailyGoal * 30);
    const quarterlyGoal = Math.ceil(dailyGoal * 90);
    const semiAnnualGoal = Math.ceil(dailyGoal * 180);

    setGoalCalculations(`
      To reach your goal, you need to make:
      - ${dailyGoal} commits per day
      - ${weeklyGoal} commits per week
      - ${monthlyGoal} commits per month
      - ${quarterlyGoal} commits per quarter
      - ${semiAnnualGoal} commits in the next 6 months
    `);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">GitHub Commit Tracker</h1>
      <div className="mb-4">
        <label className="block mb-2">Yearly Commit Target</label>
        <input
          type="number"
          value={yearlyTarget}
          onChange={(e) => setYearlyTarget(parseInt(e.target.value, 10))}
          className="border p-2 w-full"
        />
        {yearlyTarget === 0 && (
          <button
            onClick={saveYearlyTarget}
            className="mt-2 bg-green-500 text-white p-2 rounded"
          >
            Save Target
          </button>
        )}
      </div>
      {totalCommits !== null && (
        <p className="mt-4">
          Total Commits (since Jan 1, 2025): {totalCommits}
        </p>
      )}
      {result && <p className="mt-4">{result}</p>}
      {goalCalculations && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Goal Calculations:</h2>
          <pre className="whitespace-pre-wrap">{goalCalculations}</pre>
        </div>
      )}
    </div>
  );
}
