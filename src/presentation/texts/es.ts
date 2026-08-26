export const TEXTS = {
  app: {
    title: "Cineteca",
    tagline: "Tu catálogo de cine personal y descubrimiento de películas",
  },
  nav: {
    home: "Inicio",
    explore: "Explorar",
    library: "Mi cineteca",
    searchPlaceholder: "Buscar películas por título...",
    searchButton: "Buscar",
  },
  home: {
    heroTitle: "Descubre el Cine a Tu Manera",
    heroSubtitle:
      "Explora tendencias, organiza tus listas y guarda tus películas favoritas sin complicaciones.",
    trendingTitle: "Tendencias del Cine",
    trendingDay: "Hoy",
    trendingWeek: "Esta Semana",
    exploreCta: "Ver Todo el Catálogo",
  },
  explore: {
    title: "Explorar Películas",
    subtitle:
      "Filtra por género, año de estreno, nota mínima, votos y ordena los resultados según tus preferencias.",
    loadMore: "Cargar más películas",
    loadingMore: "Cargando más películas...",
    maxPageReached:
      "Has alcanzado el límite máximo de 500 páginas de resultados.",
    clearFilters: "Limpiar filtros",
    emptyFilterTitle: "No se encontraron películas con estos filtros",
    emptyFilterDesc:
      "Intenta ajustar o limpiar los criterios de filtrado para ver más resultados.",
    filters: {
      genre: "Género",
      allGenres: "Todos los géneros",
      year: "Año",
      allYears: "Todos los años",
      voteAverageMin: "Nota mínima",
      allRatings: "Cualquier nota",
      voteCountMin: "Votos mínimos",
      allVotes: "Cualquier N° de votos",
      sortBy: "Ordenar por",
      sortPopularity: "Popularidad",
      sortRating: "Valoración",
      sortReleaseDate: "Fecha de estreno",
      sortVoteCount: "Número de votos",
    },
  },
  search: {
    title: "Resultados para:",
    resultsFound: "película(s) encontrada(s)",
    noResultsTitle: "No se encontraron películas",
    noResultsDesc: "Intenta buscar con otros términos o palabras clave.",
    minCharsNotice: "Escribe al menos 2 caracteres para realizar la búsqueda.",
    page: "Página",
    of: "de",
  },
  movieDetail: {
    releaseDate: "Fecha de estreno",
    runtime: "Duración",
    budget: "Presupuesto",
    genres: "Géneros",
    status: "Estado",
    rating: "Calificación",
    overview: "Sinopsis",
    noOverview: "No hay sinopsis disponible para esta película.",
    englishOverviewNotice: "Descripción disponible en inglés",
    addToLibrary: "Guardar en mi cineteca",
    removeFromLibrary: "Quitar de mi cineteca",
    inLibrary: "En tu cineteca",
    addToList: "Agregar a una lista",
    recommendations: "Películas recomendadas",
    director: "Director",
    cast: "Reparto principal",
    trailer: "Ver Tráiler",
    minutes: "min",
    notAvailable: "Sin dato",
    noVotes: "Sin valoraciones",
  },
  library: {
    title: "Mi Cineteca",
    subtitle:
      "Gestiona las películas guardadas en tu dispositivo y tus listas personalizadas.",
    tabs: {
      saved: "Películas Guardadas",
      lists: "Mis Listas",
    },
    savedEmptyTitle: "No tienes películas guardadas",
    savedEmptyDesc:
      "Explora o busca películas y guárdalas aquí para tenerlas a la mano.",
    listsEmptyTitle: "No has creado ninguna lista",
    listsEmptyDesc:
      "Crea listas temáticas para organizar tus películas como prefieras.",
    createListButton: "Crear Nueva Lista",
    createListModalTitle: "Crear Lista Personalizada",
    listNameLabel: "Nombre de la lista",
    listNamePlaceholder: "Ej. Películas de Ciencia Ficción",
    listDescLabel: "Descripción (opcional)",
    listDescPlaceholder: "Una breve descripción de tu lista...",
    cancel: "Cancelar",
    save: "Guardar",
    movieCount: "película(s)",
  },
  listDetail: {
    emptyTitle: "Esta lista no tiene películas",
    emptyDesc:
      "Agrega películas a esta lista desde la ficha de cualquier película.",
    editList: "Editar lista",
    deleteList: "Eliminar lista",
    deleteConfirm: "¿Estás seguro de que deseas eliminar esta lista?",
    editModalTitle: "Editar Lista",
    removeFromList: "Quitar de la lista",
    createdAt: "Creada el",
    updatedAt: "Actualizada el",
  },
  components: {
    movieCard: {
      viewDetails: "Ver detalle",
      toggleSave: "Guardar",
      saved: "Guardado",
    },
    pagination: {
      prev: "Anterior",
      next: "Siguiente",
    },
    emptyState: {
      defaultTitle: "Sin información",
      defaultDesc: "No se encontraron elementos para mostrar.",
    },
    errorState: {
      title: "Algo salió mal",
      desc: "Ocurrió un error inesperado al cargar la información.",
      retry: "Reintentar",
    },
    offlineState: {
      title: "Sin conexión con el servidor",
      desc: "No pudimos contactar a TMDB. Revisa tu conexión a internet y vuelve a intentarlo.",
    },
  },
  notFound: {
    code: "404",
    title: "Esta página no existe",
    description:
      "La dirección que abriste no corresponde a ninguna sección de Cineteca. Puede que el enlace esté mal escrito o que la página se haya movido.",
    goHome: "Volver al inicio",
    goExplore: "Explorar películas",
  },
  footer: {
    disclaimer:
      "Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.",
    rights: "Todos los derechos reservados.",
  },
};
