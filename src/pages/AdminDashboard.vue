<script lang="ts"></script>

<template>
    <div class="admin-dashboard-page">
        <div class="dashboard-content">
            <article class="sidebar-wrapper">
                
            </article>
            <div class="mainContent">

            </div>
        </div>
    </div>
</template>

<style>
html, body {
    /* height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;  */
}

.admin-dashboard-page {
    display: flex;
    align-items: center;     
    justify-content: center; 
    width: 100vw;         
    height: 100vh;           
    background-color: rgb(46, 46, 46);
    margin: 0;
    padding: 0;
    overflow: hidden; 
}

.dashboard-content {
    width: calc(100% - 20px);  
    height: calc(100% - 20px);  
    background: rgba(20, 20, 20, 0.4);
    backdrop-filter: blur(16px);  
    border-radius: 16px; 
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 
                0 4px 20px rgba(0, 0, 0, 0.2); 
    z-index: 100;
    display: flex;
}

.dashboard-content:hover {
    box-shadow: 0 12px 50px rgba(0, 0, 0, 0.4), 
                0 6px 24px rgba(0, 0, 0, 0.3);
}
.sidebar-wrapper{
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px; 
    width:20%;
    background-color: #2f80ed;
}
</style>