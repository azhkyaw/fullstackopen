import { useDispatch, useSelector } from "react-redux";
import { voteOf } from "../reducers/anecdoteReducer";
import Filter from "./Filter";

const AnecdoteList = () => {
  const anecdotes = useSelector(({ anecdotes, filter }) =>
    filter === ""
      ? anecdotes
      : anecdotes.filter((a) =>
          a.content.toLowerCase().includes(filter.toLowerCase())
        )
  );
  const dispatch = useDispatch();

  const vote = (id) => {
    console.log("vote", id);
    dispatch(voteOf(id));
  };

  return (
    <>
      <Filter />
      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote.id)}>vote</button>
          </div>
        </div>
      ))}
    </>
  );
};

export default AnecdoteList;
