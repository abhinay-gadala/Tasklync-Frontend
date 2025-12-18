// src/components/Tasks.tsx
import React from "react";
import MyTasks from "./MyTask";
import { useSelector } from "react-redux";
import ManageTasks from "./ManageTask";


interface RootState{
  userStore: {
    showTask: string
  }
}

const Tasks: React.FC = () => {
  const { showTask } = useSelector((store: RootState) => store.userStore)

  return (
    <>
     {showTask ? <ManageTasks/>: <MyTasks/>}
    </>
   
  )
};

export default Tasks;
