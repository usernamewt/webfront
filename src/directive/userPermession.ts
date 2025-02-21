
export default {
    mounted(el: any) {
        // console.log(store.userProfile);
        const role = localStorage.getItem('userRole');
        el.style.display = (role==='1' ? 'block' : 'none');
    }
}