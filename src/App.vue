<template>
  <section>
    <h1>Users from RandomUser</h1>
    <div class="content" ref="contentRef">
      <div v-for="item in items" :key="item.id" class="item">
        <div class="item__top">
          <div class="item__image">
            <img :src="item.image" alt="" />
          </div>
          <div class="item__user">
            <div class="item__name">
              {{ item.name }}
            </div>
            <a :href="`tel:${item.phone}`">{{ item.phone }}</a>
          </div>
        </div>
        <div class="item__description">
          <p>{{ item.description }}</p>
        </div>
      </div>
      <div v-if="isLoading">Loading...</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import useInfiniteScroll from './infinite-scroll';

interface UserItem {
  id: string;
  name: string;
  phone: string;
  image: string;
  description: string;
}

const items = ref<UserItem[]>([]);
const contentRef = ref();
const page = ref(1);
const isLoading = ref(false);

async function loadMore() {
  isLoading.value = true;
  try {
    const res = await fetch(
      `https://randomuser.me/api/?page=${page.value}&results=10`,
    );
    const rawData = await res.json();
    const data: UserItem[] = rawData.results.map((user: any) => ({
      id: user.id.value,
      name: `${user.name.first} ${user.name.last}`,
      phone: user.phone,
      image: user.picture.thumbnail,
      description:
        'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi facere maiores reiciendis',
    }));
    items.value.push(...data);
    page.value++;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    console.error('Failed to fetch data');
  }
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
