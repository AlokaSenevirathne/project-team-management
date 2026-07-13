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
    dueDate?: string;

    project:{
        name:string;
    };

    user:{
        id:number;
        name:string;
    } | null;

}



export default function TasksPage(){


    const [tasks,setTasks] = useState<Task[]>([]);


    const [showForm,setShowForm] = useState(false);


    const [editMode,setEditMode] = useState(false);

    const [editingTaskId,setEditingTaskId] = useState<number | null>(null);



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

                assignedTo: assignedTo 
                    ? Number(assignedTo) 
                    : null

            });



            clearForm();

            fetchTasks();



        }catch(error){

            console.error(error);

        }


    };






    // Open Edit Form

    const editTask = (task:Task)=>{


        setEditMode(true);

        setEditingTaskId(task.id);


        setTitle(task.title);

        setDescription(task.description ?? "");

        setPriority(task.priority);


        if(task.dueDate){

            setDueDate(
                task.dueDate.substring(0,10)
            );

        }


        setShowForm(true);


    };






    // Update Task

    const updateTask = async()=>{


        try{


            await api.put(
                `/tasks/${editingTaskId}`,
                {

                    title,

                    description,

                    priority,

                    dueDate,

                    assignedTo: assignedTo
                        ? Number(assignedTo)
                        : null

                }
            );



            clearForm();

            fetchTasks();



        }catch(error){

            console.error(error);

        }


    };






    // Clear Form

    const clearForm = ()=>{


        setTitle("");

        setDescription("");

        setPriority("MEDIUM");

        setDueDate("");

        setProjectId("");

        setAssignedTo("");


        setEditingTaskId(null);

        setEditMode(false);

        setShowForm(false);


    };
        // Update Task Status

    const updateStatus = async (
        id:number,
        status:string
    )=>{

        try{

            await api.put(
                `/tasks/${id}/status`,
                {
                    status
                }
            );


            fetchTasks();


        }catch(error){

            console.error(error);

        }

    };






    // Delete Task

    const deleteTask = async(id:number)=>{


        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );


        if(!confirmed) return;



        try{


            await api.delete(
                `/tasks/${id}`
            );


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

                            onClick={()=>{

                                if(showForm){
                                    clearForm();
                                }
                                else{
                                    setShowForm(true);
                                }

                            }}

                            className="bg-black text-white px-5 py-2 rounded"

                        >

                            Create Task

                        </button>



                    </div>







                    {/* Task Form */}


                    {
                        showForm && (


                        <div className="bg-white rounded-xl shadow border p-6 mb-8">


                            <h2 className="text-xl font-semibold mb-4">

                                {
                                    editMode
                                    ?
                                    "Edit Task"
                                    :
                                    "Create New Task"
                                }

                            </h2>





                            <input

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Task title"

                                value={title}

                                onChange={
                                    (e)=>setTitle(e.target.value)
                                }

                            />





                            <textarea

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Description"

                                value={description}

                                onChange={
                                    (e)=>setDescription(e.target.value)
                                }

                            />






                            {
                                !editMode && (

                                <input

                                    className="border p-2 w-full mb-4 rounded"

                                    placeholder="Project ID"

                                    value={projectId}

                                    onChange={
                                        (e)=>setProjectId(e.target.value)
                                    }

                                />

                                )

                            }







                            <input

                                className="border p-2 w-full mb-4 rounded"

                                placeholder="Assigned User ID"

                                value={assignedTo}

                                onChange={
                                    (e)=>setAssignedTo(e.target.value)
                                }

                            />







                            <select

                                className="border p-2 w-full mb-4 rounded"

                                value={priority}

                                onChange={
                                    (e)=>setPriority(e.target.value)
                                }

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

                                onChange={
                                    (e)=>setDueDate(e.target.value)
                                }

                            />







                            <button

                                onClick={
                                    editMode
                                    ?
                                    updateTask
                                    :
                                    createTask
                                }

                                className="bg-blue-600 text-white px-5 py-2 rounded"

                            >

                                {
                                    editMode
                                    ?
                                    "Save Changes"
                                    :
                                    "Save Task"
                                }


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








                                <div className="mt-4">


                                    <label className="text-sm font-medium">

                                        Status

                                    </label>



                                    <select

                                        className="border rounded w-full mt-1 p-2"

                                        value={task.status}

                                        onChange={
                                            (e)=>
                                            updateStatus(
                                                task.id,
                                                e.target.value
                                            )
                                        }

                                    >

                                        <option value="TODO">
                                            TODO
                                        </option>


                                        <option value="IN_PROGRESS">
                                            IN PROGRESS
                                        </option>


                                        <option value="COMPLETED">
                                            COMPLETED
                                        </option>


                                    </select>


                                </div>








                                <div className="mt-4 text-sm">


                                    <p>
                                        Priority:
                                        <b> {task.priority}</b>
                                    </p>



                                    <p className="mt-2">
                                        Project:
                                        <b> {task.project.name}</b>
                                    </p>




                                    <p className="mt-2">
                                        Assigned:
                                        <b>
                                            {" "}
                                            {
                                                task.user?.name 
                                                ??
                                                "Not assigned"
                                            }
                                        </b>
                                    </p>


                                </div>









                                <div className="flex gap-3 mt-6">


                                    <button

                                        onClick={()=>
                                            editTask(task)
                                        }

                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"

                                    >

                                        Edit

                                    </button>






                                    <button

                                        onClick={()=>
                                            deleteTask(task.id)
                                        }

                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"

                                    >

                                        Delete

                                    </button>



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