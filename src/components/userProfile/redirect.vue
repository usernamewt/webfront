<script lang="ts" setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
onMounted(() => {
  const { query } = route;
  const path = query.path as string;
  router.push(path);
});
</script>
