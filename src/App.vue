<template>
  <section>
    <h1>Users from RandomUser</h1>
    <div class="content" ref="contentRef">
      <div v-for="item in items" :key="item.id.value" class="item">
        <div class="item__top">
          <div class="item__image">
            <img :src="item.picture.thumbnail" alt="" />
          </div>
          <div class="item__user">
            <div class="item__name">
              {{ item.name.first }} {{ item.name.last }}
            </div>
            <a :href="`tel:${item.phone}`">{{ item.phone }}</a>
          </div>
        </div>
        <div class="item__description">
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi
            facere maiores reiciendis
          </p>
        </div>
      </div>
      <div v-if="isLoading">Loading...</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import useInfiniteScroll from './infinite-scroll';

const items = ref<any>([]);
const contentRef = ref();
const page = ref(1);
const isLoading = ref(false);

async function loadMore() {
  isLoading.value = true;
  const res = await fetch(
    `https://randomuser.me/api/?page=${page.value}&results=10`,
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
