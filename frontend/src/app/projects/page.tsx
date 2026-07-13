"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";


interface Project {
    id: number;
    name: string;
    description: string | null;
    manager: {
        name: string;
    };
}


export default function ProjectsPage() {


    const [projects, setProjects] = useState<Project[]>([]);

    const [showForm, setShowForm] = useState(false);

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");



    // Get all projects
    const fetchProjects = async () => {

        try {

            const response = await api.get("/projects");

            setProjects(response.data);


        } catch(error) {

            console.error("Failed to fetch projects", error);

        }

    };



    useEffect(() => {

        fetchProjects();

    }, []);





    // Create new project
    const createProject = async () => {

        try {

            await api.post("/projects", {

                name,
                description

            });



            // Clear inputs
            setName("");

            setDescription("");


            // Close form
            setShowForm(false);


            // Reload projects
            fetchProjects();


        } catch(error) {

            console.error("Failed to create project", error);

        }

    };





    return (

        <div className="min-h-screen bg-gray-50">


            <Navbar />


            <div className="flex">


                <Sidebar />



                <main className="flex-1 p-8">



                    {/* Header */}

                    <div className="flex justify-between items-center mb-8">


                        <div>

                            <h1 className="text-3xl font-bold">
                                Projects
                            </h1>


                            <p className="text-gray-600 mt-2">
                                Manage your projects
                            </p>

                        </div>



                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-black text-white px-5 py-2 rounded"
                        >
                            Create Project
                        </button>



                    </div>





                    {/* Create Project Form */}

                    {
                        showForm && (

                            <div className="bg-white rounded-xl shadow p-6 border mb-8">


                                <h2 className="text-xl font-semibold mb-4">
                                    Create New Project
                                </h2>



                                <input

                                    className="border p-2 w-full mb-4 rounded"

                                    placeholder="Project name"

                                    value={name}

                                    onChange={(e)=>setName(e.target.value)}

                                />




                                <textarea

                                    className="border p-2 w-full mb-4 rounded"

                                    placeholder="Project description"

                                    value={description}

                                    onChange={(e)=>setDescription(e.target.value)}

                                />




                                <button

                                    onClick={createProject}

                                    className="bg-blue-600 text-white px-5 py-2 rounded"

                                >

                                    Save Project

                                </button>



                            </div>

                        )
                    }







                    {/* Project Cards */}


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



                        {
                            projects.map((project)=>(


                                <div

                                    key={project.id}

                                    className="bg-white rounded-xl shadow p-6 border"

                                >



                                    <h2 className="text-xl font-semibold">

                                        {project.name}

                                    </h2>




                                    <p className="text-gray-600 mt-2">

                                        {project.description}

                                    </p>




                                    <p className="text-sm text-gray-500 mt-4">

                                        Manager: {project.manager.name}

                                    </p>




                                </div>


                            ))
                        }



                    </div>



                </main>


            </div>


        </div>

    );

}