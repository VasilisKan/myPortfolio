<script lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTicket, faCalendar, faUser, faHome, faCog } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faTicket, faCalendar, faUser, faHome, faCog);

export default {
    name: 'DashboardSidebar',
    components: {
        FontAwesomeIcon
    },
    emits: ['update-active'],  
    data() {
        return {
            activeItem: 'Tickets', 
            mainMenu: [
                {
                    category: 'Main Menu',
                    subCategories: [
                        { name: 'Dashboard', icon: ['fas', 'calendar'] },
                        { name: 'Tickets', icon: ['fas', 'ticket'] },
                        { name: 'Users', icon: ['fas', 'user'] },
                        { name: 'Settings', icon: ['fas', 'cog'] }
                    ]
                }
            ]
        };
    },
    methods: {
        setActive(itemName: string) {
            this.activeItem = itemName;
            this.$emit('update-active', itemName);  
        }
    }
};
</script>

<template>
    <div class="sidebar-wrap">
        <img src="./../assets/logoMainTransparent.webp" alt="logoTransparent" class="logo" />

        <div v-for="(category, index) in mainMenu" :key="index">
            <h3 class="category-title">{{ category.category }}</h3>
            
            <div 
                v-for="(item, idx) in category.subCategories" 
                :key="idx" 
                :class="['menu-item', { active: activeItem === item.name }]"
                @click="setActive(item.name)"
            >
                <font-awesome-icon :icon="item.icon" class="menu-icon" />
                <span>{{ item.name }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sidebar-wrap {
    display: flex;
    flex-direction: column;
    padding: 30px 0px 0px 30px;
    color: grey;
}
.sidebar-wrap .logo {
    width: 80px;
    height: auto;
}

.category-title {
    margin-top: 30px;
    margin-bottom: 10px;
    font-weight: 700;
    color: #b3b3b3;
    font-size: 18px;
}
.menu-item {
    padding: 10px 5px;
    display: flex;
    align-items: center;
    cursor: pointer;
}  
.menu-item span {
    font-size: 17px;
    font-weight: 700;
    transition: color 0.3s;
}

.menu-icon {
    font-size: 20px;
    color: b3b3b3; 
    transition: color 0.3s;
    margin-right: 20px;
}
.menu-item:hover .menu-icon,
.menu-item:hover span,
.menu-item.active .menu-icon,
.menu-item.active{
    color: white; 
    
}

.menu-item.active,
.menu-item:hover {
    border-right: 1px solid #29cdff; 
    background: linear-gradient(to right, #4ae4ff00, #1D8BF117);
}
</style>
