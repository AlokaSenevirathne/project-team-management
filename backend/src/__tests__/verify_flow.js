const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function run() {
  console.log('==================================================');
  console.log('STARTING END-TO-END FLOW PROGRAMMATIC VERIFICATION');
  console.log('==================================================\n');

  try {
    // 1. Authenticate as Project Manager
    console.log('Step 1: Authenticating as Project Manager (manager@taskflow.com)...');
    const pmLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'manager@taskflow.com',
      password: 'manager123',
    });
    const pmToken = pmLoginRes.data.token;
    console.log(`✔ Authenticated successfully! Token acquired.\n`);

    const pmHeaders = { Authorization: `Bearer ${pmToken}` };

    // 2. Create Project
    console.log('Step 2: Creating project "Aesthetics Upgrades"...');
    const projectRes = await axios.post(
      `${BASE_URL}/projects`,
      {
        name: 'Aesthetics Upgrades',
        description: 'Overhaul UI widgets with glassmorphic cards and glowing borders',
      },
      { headers: pmHeaders }
    );
    const project = projectRes.data.project;
    console.log(`✔ Project created successfully! ID: ${project.id}, Name: "${project.name}"\n`);

    // 3. Find Team Member User ID
    console.log('Step 3: Fetching user directory to find "Alex Developer"...');
    const usersRes = await axios.get(`${BASE_URL}/users`, { headers: pmHeaders });
    const memberUser = usersRes.data.find(u => u.email === 'member1@taskflow.com');
    if (!memberUser) {
      throw new Error('Could not find user member1@taskflow.com');
    }
    console.log(`✔ Found member! ID: ${memberUser.id}, Name: "${memberUser.name}"\n`);

    // 4. Add Member to Project
    console.log(`Step 4: Adding member "${memberUser.name}" to project "${project.name}"...`);
    const addMemberRes = await axios.post(
      `${BASE_URL}/projects/${project.id}/members`,
      { userId: memberUser.id },
      { headers: pmHeaders }
    );
    console.log(`✔ Member added successfully! Membership ID: ${addMemberRes.data.member.id}\n`);

    // 5. Create Task for Project assigned to Alex Developer
    console.log('Step 5: Creating task "Refine Dashboard Widgets" and assigning it...');
    const taskRes = await axios.post(
      `${BASE_URL}/tasks`,
      {
        projectId: project.id,
        title: 'Refine Dashboard Widgets',
        description: 'Implement glassmorphism styling and verify responsive layouts',
        priority: 'HIGH',
        assignedTo: memberUser.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      },
      { headers: pmHeaders }
    );
    const task = taskRes.data.task;
    console.log(`✔ Task created successfully! ID: ${task.id}, Status: "${task.status}", Assignee ID: ${task.assignedTo}\n`);

    // 6. Authenticate as Team Member (Alex Developer)
    console.log('Step 6: Authenticating as Team Member (member1@taskflow.com)...');
    const tmLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'member1@taskflow.com',
      password: 'member123',
    });
    const tmToken = tmLoginRes.data.token;
    console.log(`✔ Authenticated successfully! Token acquired.\n`);

    const tmHeaders = { Authorization: `Bearer ${tmToken}` };

    // 7. Update Task Status to IN_PROGRESS
    console.log(`Step 7: Updating task status to "IN_PROGRESS" as assignee...`);
    const updateStatusRes = await axios.put(
      `${BASE_URL}/tasks/${task.id}/status`,
      { status: 'IN_PROGRESS' },
      { headers: tmHeaders }
    );
    console.log(`✔ Task status updated! New Status: "${updateStatusRes.data.task.status}"\n`);

    // 8. Post Comment on Task
    console.log('Step 8: Posting comment on task...');
    const commentRes = await axios.post(
      `${BASE_URL}/tasks/${task.id}/comments`,
      { content: 'Starting the design implementation now.' },
      { headers: tmHeaders }
    );
    const comment = commentRes.data.comment;
    console.log(`✔ Comment posted successfully! Comment ID: ${comment.id}, Author: "${comment.user.name}"\n`);

    // 9. Fetch Task Comments to verify list
    console.log('Step 9: Listing comments of the task to verify inclusion...');
    const commentsListRes = await axios.get(
      `${BASE_URL}/tasks/${task.id}/comments`,
      { headers: tmHeaders }
    );
    console.log(`✔ Verification complete! Found comment: "${commentsListRes.data[0].content}"`);
    console.log(`   Posted by: ${commentsListRes.data[0].user.name} (${commentsListRes.data[0].user.role})\n`);

    console.log('==================================================');
    console.log('ALL STEPS PASSED SUCCESSFULLY! APPLICATION STACK OK');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Verification failed with error:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

run();
