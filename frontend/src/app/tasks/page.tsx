"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";


interface Task {

    id: number;
    title: string;
    description: string | null;
    status: string;
    priority: string;

    project:{
        name:string;
    };

    user:{
        name:string;
    } | null;

}



export default function TasksPage(){


    const [tasks,setTasks] = useState<Task[]>([]);


    const [showForm,setShowForm] = useState(false);


    const [title,setTitle] = useState("");

    const [description,setDescription] = useState("");

    const [priority,setPriority] = useState("MEDIUM");

    const [dueDate,setDueDate] = useState("");

    const [projectId,setProjectId] = useState("");

    const [assignedTo,setAssignedTo] = useState("");




    // Fetch Tasks

    const fetchTasks = async()=>{

        try{

            const response = await api.get("/tasks");

            setTasks(response.data);


        }catch(error){

            console.error(error);

        }

    };



    useEffect(()=>{

        fetchTasks();

    },[]);





    // Create Task

    const createTask = async()=>{


        try{


            await api.post("/tasks",{

                title,

                description,

                priority,

                dueDate,

                projectId:Number(projectId),

                assignedTo: assignedTo ? Number(assignedTo) : null

            });



            setTitle("");

            setDescription("");

            setPriority("MEDIUM");

            setDueDate("");

            setProjectId("");

            setAssignedTo("");

            setShowForm(false);


            fetchTasks();



        }catch(error){

            console.error(error);

        }


    };





    return (

        <div className="min-h-screen bg-gray-50">


            <Navbar/>


            <div className="flex">


                <Sidebar/>




                <main className="flex-1 p-8">



                    <div className="flex justify-between items-center mb-8">


                        <div>

                            <h1 className="text-3xl font-bold">
                                Tasks
                            </h1>


                            <p className="text-gray-600 mt-2">
                                Manage project tasks
                            </p>

                        </div>




                        <button

                            onClick={()=>setShowForm(!showForm)}

                            className="bg-black text-white px-5 py-2 rounded"

                        >

                            Create Task

                        </button>


                    </div>







                    {/* Create Task Form */}


                    {
                        showForm && (

                        <div className="bg-white rounded-xl shadow border p-6 mb-8">


                            <h2 className="text-xl font-semibold mb-4">
                                Create New Task
                            </h2>



                            <input

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Task title"

                                value={title}

                                onChange={(e)=>setTitle(e.target.value)}

                            />




                            <textarea

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Description"

                                value={description}

                                onChange={(e)=>setDescription(e.target.value)}

                            />





                            <input

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Project ID"

                                value={projectId}

                                onChange={(e)=>setProjectId(e.target.value)}

                            />





                            <input

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Assigned User ID"

                                value={assignedTo}

                                onChange={(e)=>setAssignedTo(e.target.value)}

                            />






                            <select

                                className="border p-2 w-full mb-4 rounded"

                                value={priority}

                                onChange={(e)=>setPriority(e.target.value)}

                            >

                                <option value="LOW">
                                    LOW
                                </option>

                                <option value="MEDIUM">
                                    MEDIUM
                                </option>

                                <option value="HIGH">
                                    HIGH
                                </option>


                            </select>





                            <input

                                type="date"

                                className="border p-2 w-full mb-4 rounded"

                                value={dueDate}

                                onChange={(e)=>setDueDate(e.target.value)}

                            />





                            <button

                                onClick={createTask}

                                className="bg-blue-600 text-white px-5 py-2 rounded"

                            >

                                Save Task

                            </button>



                        </div>

                        )
                    }









                    {/* Task Cards */}



                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



                    {
                        tasks.map((task)=>(


                            <div

                                key={task.id}

                                className="bg-white rounded-xl shadow border p-6"

                            >



                                <h2 className="text-xl font-semibold">

                                    {task.title}

                                </h2>



                                <p className="text-gray-600 mt-2">

                                    {task.description}

                                </p>




                                <div className="mt-4 text-sm">


                                    <p>
                                        Status:
                                        <b> {task.status}</b>
                                    </p>


                                    <p>
                                        Priority:
                                        <b> {task.priority}</b>
                                    </p>



                                    <p>
                                        Project:
                                        <b> {task.project.name}</b>
                                    </p>



                                    <p>
                                        Assigned:
                                        <b>
                                            {" "}
                                            {task.user?.name ?? "Not assigned"}
                                        </b>
                                    </p>


                                </div>



                            </div>


                        ))
                    }



                    </div>




                </main>


            </div>


        </div>

    );

}