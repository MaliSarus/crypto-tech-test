<template>
  <div class="content" ref="contentRef">
    <div v-for="(item, index) in items" :key="index" class="item">
      {{ item.name.first }}
    </div>
    <div v-if="isLoading">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import useInfiniteScroll from "./infinite-scroll";

const items = ref<any>([]);
const contentRef = ref();
const page = ref(1);
const isLoading = ref(false);

async function loadMore() {
  isLoading.value = true;
  const res = await fetch(
    `https://randomuser.me/api/?page=${page.value}&results=10`
  );
  const data = await res.json();
  items.value.push(...data.results);
  page.value++;
  isLoading.value = false;
}
const { init, uninit } = useInfiniteScroll({
  callback: loadMore,
});
onMounted(() => {
  init();
});
onUnmounted(() => {
  uninit();
});
</script>

<style scoped>
.item {
  padding: 50px;
  background: red;
}
.item:not(:last-child) {
  margin-bottom: 30px;
}
</style>
