import { useDispatch } from "react-redux";
import { filterChange } from "../reducers/filterReducer";

const Filter = () => {
  const dispatch = useDispatch();

  return (
    <div style={{ marginBottom: 10 }}>
      filter <input onChange={(e) => dispatch(filterChange(e.target.value))} />
    </div>
  );
};

export default Filter;
