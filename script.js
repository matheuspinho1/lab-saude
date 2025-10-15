// Variáveis globais para paginação de mídia
let currentMediaIndex = 0;
let currentMediaArray = [];
let currentLabName = '';
let slideshowInterval = null;
let map;

// Função para detectar tipo de arquivo
function getMediaType(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    
    if (videoExtensions.includes(extension)) return 'video';
    if (imageExtensions.includes(extension)) return 'image';
    return 'unknown';
}

// Função para criar thumbnail de vídeo
function createVideoThumbnail(videoSrc) {
    return `
        <video muted preload="metadata">
            <source src="${videoSrc}#t=1" type="video/mp4">
        </video>
        <div class="play-button">▶</div>
        <div class="media-type-indicator video-indicator">🎥 VÍDEO</div>
    `;
}

// Função para criar thumbnail de imagem
function createImageThumbnail(imageSrc) {
    return `
        <img src="${imageSrc}" alt="Foto do laboratório" onerror="this.src='assets/images/placeholder.jpg'">
        <div class="media-type-indicator image-indicator">🖼️ FOTO</div>
    `;
}

// Função para abrir modal com galeria completa
function openModalGallery(mediaArray, startIndex, labName) {
    currentMediaArray = mediaArray;
    currentMediaIndex = startIndex;
    currentLabName = labName;
    
    const modal = document.getElementById('mediaModal');
    modal.style.display = 'block';
    
    updateModalContent();
    createThumbnailIndicators();
}

// Função para navegar entre mídias
function navigateMedia(direction) {
    if (direction === 'next' && currentMediaIndex < currentMediaArray.length - 1) {
        currentMediaIndex++;
    } else if (direction === 'prev' && currentMediaIndex > 0) {
        currentMediaIndex--;
    }
    
    updateModalContent();
}

// Função para slideshow automático
function playSlideshow() {
    const slideshowBtn = document.getElementById('slideshowBtn');
    
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
        slideshowBtn.textContent = '🎮 Slideshow';
    } else {
        slideshowBtn.textContent = '⏸️ Pausar';
        slideshowInterval = setInterval(() => {
            if (currentMediaIndex < currentMediaArray.length - 1) {
                navigateMedia('next');
            } else {
                currentMediaIndex = 0;
                updateModalContent();
            }
        }, 3000);
    }
}

// Função para download de mídia
function downloadMedia() {
    if (currentMediaArray.length === 0) return;
    
    const currentMedia = currentMediaArray[currentMediaIndex];
    const link = document.createElement('a');
    link.href = currentMedia;
    link.download = currentMedia.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Função para tela cheia
function fullscreenMedia() {
    const modal = document.getElementById('mediaModal');
    if (modal.requestFullscreen) {
        modal.requestFullscreen();
    } else if (modal.webkitRequestFullscreen) {
        modal.webkitRequestFullscreen();
    } else if (modal.msRequestFullscreen) {
        modal.msRequestFullscreen();
    }
}

// Função para atualizar o conteúdo do modal
function updateModalContent() {
    if (currentMediaArray.length === 0) return;
    
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const modalTitle = document.getElementById('modalTitle');
    const modalCounter = document.getElementById('modalCounter');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    const currentMedia = currentMediaArray[currentMediaIndex];
    const mediaType = getMediaType(currentMedia);
    const mediaName = currentMedia.split('/').pop();
    
    modalTitle.textContent = `${currentLabName} - ${mediaName}`;
    modalCounter.textContent = `${currentMediaIndex + 1} de ${currentMediaArray.length}`;
    
    loadingSpinner.style.display = 'block';
    modalImage.style.display = 'none';
    modalVideo.style.display = 'none';
    
    prevBtn.disabled = currentMediaIndex === 0;
    nextBtn.disabled = currentMediaIndex === currentMediaArray.length - 1;
    
    if (mediaType === 'video') {
        modalVideo.onloadstart = () => loadingSpinner.style.display = 'none';
        modalVideo.oncanplay = () => loadingSpinner.style.display = 'none';
        modalVideo.src = currentMedia;
        modalVideo.style.display = 'block';
        modalVideo.load();
    } else {
        modalImage.onload = () => loadingSpinner.style.display = 'none';
        modalImage.onerror = () => {
            loadingSpinner.style.display = 'none';
            modalImage.src = 'assets/images/placeholder.jpg';
        };
        modalImage.src = currentMedia;
        modalImage.style.display = 'block';
    }
    
    updateThumbnailIndicators();
}

// Função para criar thumbnails indicadores
function createThumbnailIndicators() {
    const indicatorsContainer = document.getElementById('thumbnailIndicators');
    
    if (currentMediaArray.length <= 1) {
        indicatorsContainer.style.display = 'none';
        return;
    }
    
    indicatorsContainer.style.display = 'flex';
    indicatorsContainer.innerHTML = '';
    
    currentMediaArray.forEach((mediaSrc, index) => {
        const mediaType = getMediaType(mediaSrc);
        const indicator = document.createElement('div');
        indicator.className = `thumbnail-indicator ${index === currentMediaIndex ? 'active' : ''}`;
        indicator.onclick = () => {
            currentMediaIndex = index;
            updateModalContent();
        };
        
        if (mediaType === 'video') {
            indicator.innerHTML = `
                <video muted preload="metadata">
                    <source src="${mediaSrc}#t=1" type="video/mp4">
                </video>
                <div class="thumb-play">▶</div>
            `;
        } else {
            indicator.innerHTML = `<img src="${mediaSrc}" alt="Thumbnail" onerror="this.src='assets/images/placeholder.jpg'">`;
        }
        
        indicatorsContainer.appendChild(indicator);
    });
}

// Função para atualizar thumbnails ativos
function updateThumbnailIndicators() {
    const indicators = document.querySelectorAll('.thumbnail-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentMediaIndex);
    });
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('mediaModal');
    const modalVideo = document.getElementById('modalVideo');
    
    modal.style.display = 'none';
    modalVideo.pause();
    
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
        document.getElementById('slideshowBtn').textContent = '🎮 Slideshow';
    }
    
    currentMediaArray = [];
    currentMediaIndex = 0;
    currentLabName = '';
}

// Aguardar o DOM estar pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar o mapa focado no Brasil
    map = L.map('map', {
        center: [-14.2350, -51.9253],
        zoom: 4,
        zoomControl: true,
        scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Função para criar popup personalizado
    function createCustomPopup(lab) {
        if (!lab.imagens || lab.imagens.length === 0) {
            return `
                <div class="custom-popup">
                    <div class="popup-header">
                        <div class="popup-title">${lab.unidade}</div>
                        <div class="popup-subtitle">${lab.cidade || lab.dr}/${lab.uf || ''}</div>
                    </div>
                    <div class="popup-content">
                        <div class="popup-info">
                            <p><strong>🏢 Unidade:</strong> ${lab.codigo_unidade || lab.unidade}</p>
                            <p><strong>📍 Endereço:</strong> ${lab.endereco || 'N/A'}</p>
                            <p><strong>📮 CEP:</strong> ${lab.cep || 'N/A'}</p>
                            <p><strong>📋 Descrição:</strong> ${lab.descricao || 'Laboratório de Simulação Realística'}</p>
                        </div>
                        <div class="no-media">📸 Nenhuma imagem ou vídeo disponível</div>
                    </div>
                </div>
            `;
        }

        const mediaGallery = lab.imagens.map((mediaSrc, index) => {
            const mediaType = getMediaType(mediaSrc);
            const thumbnailContent = mediaType === 'video' 
                ? createVideoThumbnail(mediaSrc)
                : createImageThumbnail(mediaSrc);
            
            return `
                <div class="gallery-item" onclick="openModalGallery(${JSON.stringify(lab.imagens).replace(/"/g, '&quot;')}, ${index}, '${lab.unidade}')">
                    ${thumbnailContent}
                </div>
            `;
        }).join('');

        return `
            <div class="custom-popup">
                <div class="popup-header">
                    <div class="popup-title">${lab.unidade}</div>
                    <div class="popup-subtitle">${lab.cidade || lab.dr}/${lab.uf || ''}</div>
                </div>
                <div class="popup-content">
                    <div class="popup-info">
                        <p><strong>🏢 Unidade:</strong> ${lab.codigo_unidade || lab.unidade}</p>
                        <p><strong>📍 Endereço:</strong> ${lab.endereco || 'N/A'}</p>
                        <p><strong>📮 CEP:</strong> ${lab.cep || 'N/A'}</p>
                        <p><strong>📋 Descrição:</strong> ${lab.descricao || 'Laboratório de Simulação Realística'}</p>
                    </div>
                    <div class="media-gallery">
                        <div class="gallery-title">Mídia do Laboratório:</div>
                        <p class="label-midia">Clique para expandir e navegar entre as mídias</p>
                        <div class="gallery-grid">
                            ${mediaGallery}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Função para contar regiões
    function countByRegion(labs) {
        const regionMapping = {
            'AC': 'Norte/Centro-Oeste', 'AP': 'Norte/Centro-Oeste', 'AM': 'Norte/Centro-Oeste', 'PA': 'Norte/Centro-Oeste', 'RO': 'Norte/Centro-Oeste', 'RR': 'Norte/Centro-Oeste', 'TO': 'Norte/Centro-Oeste',
            'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
            'DF': 'Norte/Centro-Oeste', 'GO': 'Norte/Centro-Oeste', 'MT': 'Norte/Centro-Oeste', 'MS': 'Norte/Centro-Oeste',
            'ES': 'Sul/Sudeste', 'MG': 'Sul/Sudeste', 'RJ': 'Sul/Sudeste', 'SP': 'Sul/Sudeste',
            'PR': 'Sul/Sudeste', 'RS': 'Sul/Sudeste', 'SC': 'Sul/Sudeste'
        };

        const regionCounts = {};
        
        labs.forEach(lab => {
            const region = regionMapping[lab.uf] || 'Outros';
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });

        return regionCounts;
    }

    // Função para criar gráfico de pizza de regiões
    function createRegionChart(regionCounts) {
        const ctx = document.getElementById('regionChart').getContext('2d');
        
        const regionColors = {
            'Norte/Centro-Oeste': '#004a8d',
            'Nordeste': '#fdc180',
            'Sul/Sudeste': '#f7941d'
        };

        const labels = Object.keys(regionCounts);
        const data = Object.values(regionCounts);
        const colors = labels.map(region => regionColors[region] || '#999');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: document.body.classList.contains('dark') ? '#2a374a' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        right: 20
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            color: document.body.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
                            font: {
                                size: 12
                            },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} unidades (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Carregar dados do JSON externo
    fetch('jsons/laboratorios/laboratorios.json')
        .then(response => response.json())
        .then(data => {
            // Suportar tanto o formato antigo quanto o novo
            const labs = data.laboratorios || data;
            
            // Atualizar métricas
            document.getElementById('totalUnidades').textContent = labs.length;
            const uniqueStates = new Set(labs.map(lab => lab.uf)).size;
            document.getElementById('totalEstados').textContent = uniqueStates;
            
            // Contar e criar gráfico de regiões
            const regionCounts = countByRegion(labs);
            createRegionChart(regionCounts);

            // Contar estados e criar gráfico de colunas
            const stateCounts = labs.reduce((acc, lab) => {
                const state = lab.uf || 'N/A';
                acc[state] = (acc[state] || 0) + 1;
                return acc;
            }, {});

            const sortedStates = Object.entries(stateCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);

            const stateLabels = sortedStates.map(state => state[0]);
            const stateData = sortedStates.map(state => state[1]);

            const ctxDr = document.getElementById('drChart').getContext('2d');
            new Chart(ctxDr, {
                type: 'bar',
                data: {
                    labels: stateLabels,
                    datasets: [{
                        label: 'Número de Unidades',
                        data: stateData,
                        backgroundColor: '#004a8d',
                        borderColor: '#004a8d',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                color: document.body.classList.contains('dark') ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                                color: document.body.classList.contains('dark') ? '#374151' : '#e5e7eb'
                            }
                        },
                        x: {
                            ticks: {
                                color: document.body.classList.contains('dark') ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            // Adicionar marcadores ao mapa
            labs.forEach(lab => {
                if (lab.latitude && lab.longitude) {
                    const customIcon = L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="
                            background-color: #3b82f6;
                            width: 25px;
                            height: 25px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 12px;
                        ">🏥</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    const marker = L.marker([lab.latitude, lab.longitude], { icon: customIcon })
                        .addTo(map)
                        .bindPopup(createCustomPopup(lab), {
                            maxWidth: 450,
                            className: 'custom-leaflet-popup'
                        });

                    marker.bindTooltip(`<strong>${lab.unidade}</strong><br>${lab.cidade || lab.dr}/${lab.uf || ''}`, {
                        permanent: false,
                        direction: 'top'
                    });
                }
            });

            // Carregar dados de matrículas
            fetch('jsons/laboratorios/matriculas.json')
                .then(response => response.json())
                .then(matriculasData => {
                    const tabelaBody = document.getElementById('tabela-unidades');
                    
                    matriculasData.forEach(item => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${item.uf || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item.unidade || 'N/A'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item['Técnico em enfermagem 2024'] || '0'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${item['Técnico em enfermagem 2025'] || '0'}</td>
                        `;
                        tabelaBody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Erro ao carregar matriculas.json:', error);
                });

            console.log('🗺️ Dashboard carregado com sucesso!');
            console.log(`📍 ${labs.length} laboratórios adicionados ao mapa`);
        })
        .catch(error => {
            console.error('Erro ao carregar laboratorios.json:', error);
        });

    // Event listeners para modal
    document.querySelector('.close').onclick = closeModal;

    window.onclick = function(event) {
        const modal = document.getElementById('mediaModal');
        if (event.target === modal) {
            closeModal();
        }
    }

    // Teclas de atalho
    document.addEventListener('keydown', function(event) {
        const modal = document.getElementById('mediaModal');
        if (modal.style.display === 'block') {
            if (event.key === 'Escape') {
                closeModal();
            } else if (event.key === 'ArrowLeft') {
                navigateMedia('prev');
            } else if (event.key === 'ArrowRight') {
                navigateMedia('next');
            } else if (event.key === 'f' || event.key === 'F') {
                fullscreenMedia();
            } else if (event.key === 'd' || event.key === 'D') {
                downloadMedia();
            } else if (event.key === ' ') {
                event.preventDefault();
                playSlideshow();
            }
        }
    });
});