import { useState } from "react";

const Statistics = ({ good, neutral, bad }) => {
  const total = good + neutral + bad;
  const averageScore = (good * 1 + bad * -1) / total;
  const positivePercentage = (good / total) * 100;

  return (
    <>
      <h1>statistics</h1>
      {total === 0 ? (
        <div>No feedback given</div>
      ) : (
        <div>
          <table>
            <tbody>
              <StatisticLine text="good" value={good} />
              <StatisticLine text="neutral" value={neutral} />
              <StatisticLine text="bad" value={bad} />
              <StatisticLine text="total" value={total} />
              <StatisticLine text="average" value={averageScore} />
              <StatisticLine
                text="positive"
                value={positivePercentage + " %"}
              />
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}> {text} </button>
);

const StatisticLine = ({ text, value }) => (
  <tr>
    <td>{text}</td>
    <td>{value}</td>
  </tr>
);

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);

  return (
    <>
      <h1>give feedback</h1>
      <Button handleClick={() => setGood(good + 1)} text="good" />
      <Button handleClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button handleClick={() => setBad(bad + 1)} text="bad" />
      <Statistics good={good} neutral={neutral} bad={bad} />
    </>
  );
};

export default App;
