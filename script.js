// Global state
let currentPlan = 'transform';
let charts = {};

// Plan tier requirements
const tierRequirements = {
    'overview': 'insight',
    'heatmaps': 'insight',
    'forecasting': 'insight',
    'risk': 'insight',
    'marketplace': 'activate',
    'matching': 'activate',
    'assembly': 'activate',
    'profiles': 'transform',
    'careers': 'transform',
    'learning': 'transform',
    'plans': 'insight'
};

const tierOrder = ['insight', 'activate', 'transform'];

// Initialize on DOM load - consolidated initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializePlanSelector();
    initializeCharts();
    initializeHeatmap();
    initializeSkillNetwork();
    animateMetrics();
    updatePlanLocks();
    initializeFilterChips();
    initializeProjectSelection();
    initializeTabAnimationObserver();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            const requiredTier = this.dataset.tier;
            
            // Check if locked
            if (requiredTier && !canAccessFeature(requiredTier)) {
                showUpgradeOverlay(requiredTier, tab);
                return;
            }
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Switch tabs
            switchTab(tab);
        });
    });
}

function canAccessFeature(requiredTier) {
    const currentTierIndex = tierOrder.indexOf(currentPlan);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    return currentTierIndex >= requiredTierIndex;
}

function switchTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

// Plan Selector
function initializePlanSelector() {
    const planDropdown = document.getElementById('planDropdown');
    const planBadge = document.getElementById('currentPlanBadge');
    
    planDropdown.addEventListener('change', function() {
        currentPlan = this.value;
        
        // Update badge
        planBadge.textContent = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
        
        // Update badge styling
        planBadge.className = 'plan-badge';
        
        // Update locks
        updatePlanLocks();
    });
}

function updatePlanLocks() {
    const navItems = document.querySelectorAll('.nav-item[data-tier]');
    
    navItems.forEach(item => {
        const requiredTier = item.dataset.tier;
        if (canAccessFeature(requiredTier)) {
            item.classList.remove('locked');
        } else {
            item.classList.add('locked');
        }
    });
}

// Upgrade Overlay
function showUpgradeOverlay(requiredTier, feature) {
    const overlay = document.getElementById('upgradeOverlay');
    const title = document.getElementById('upgradeTitle');
    const message = document.getElementById('upgradeMessage');
    
    const featureNames = {
        'marketplace': 'Project Marketplace',
        'matching': 'AI Skill Matching',
        'assembly': 'Team Assembly',
        'profiles': 'AI Skill Profiles',
        'careers': 'Career Paths',
        'learning': 'Learning Hub'
    };
    
    const tierNames = {
        'activate': 'Activate',
        'transform': 'Transform'
    };
    
    title.textContent = `Upgrade to ${tierNames[requiredTier]}`;
    message.textContent = `Unlock ${featureNames[feature]} and more with the ${tierNames[requiredTier]} plan.`;
    
    overlay.classList.remove('hidden');
}

function closeUpgradeOverlay() {
    const overlay = document.getElementById('upgradeOverlay');
    overlay.classList.add('hidden');
}

// Initialize Charts
function initializeCharts() {
    // Skill Distribution Chart
    const skillDistCtx = document.getElementById('skillDistributionChart');
    if (skillDistCtx) {
        charts.skillDistribution = new Chart(skillDistCtx, {
            type: 'bar',
            data: {
                labels: ['Homes.com', 'CoStar Commercial', 'Apartments.com', 'Matterport', 'LoopNet', 'Ten-X'],
                datasets: [
                    {
                        label: 'Technical',
                        data: [450, 520, 380, 290, 310, 180],
                        backgroundColor: '#0A66C2'
                    },
                    {
                        label: 'Data',
                        data: [180, 220, 160, 140, 130, 90],
                        backgroundColor: '#006599'
                    },
                    {
                        label: 'AI/ML',
                        data: [120, 95, 85, 180, 70, 45],
                        backgroundColor: '#388e3c'
                    },
                    {
                        label: 'Business',
                        data: [200, 180, 220, 90, 140, 110],
                        backgroundColor: '#ffa726'
                    },
                    {
                        label: 'Creative',
                        data: [140, 60, 180, 120, 90, 50],
                        backgroundColor: '#d32f2f'
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Category Breakdown Chart
    const categoryCtx = document.getElementById('categoryBreakdownChart');
    if (categoryCtx) {
        charts.categoryBreakdown = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Technical', 'Data & Analytics', 'AI/ML', 'Business', 'Creative'],
                datasets: [{
                    data: [35, 25, 15, 15, 10],
                    backgroundColor: [
                        '#0A66C2',
                        '#006599',
                        '#388e3c',
                        '#ffa726',
                        '#d32f2f'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Heatmap constants
const HEATMAP_COLUMN_COUNT = 8;
const HEATMAP_DENSITY_MULTIPLIER = 17;
const HEATMAP_MIN_DENSITY = 10;
const HEATMAP_MAX_DENSITY_RANGE = 90;
const HEATMAP_CRITICAL_THRESHOLD = 25;

// Initialize Heatmap
function initializeHeatmap() {
    const heatmapGrid = document.getElementById('heatmapGrid');
    if (!heatmapGrid) return;
    
    const departments = ['Engineering', 'Product', 'Data Science', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
    const skillCategories = ['Technical', 'AI/ML', 'Data', 'Cloud', 'Business', 'Leadership'];
    
    // Create header row
    const headerCell = document.createElement('div');
    headerCell.className = 'heatmap-cell heatmap-header';
    heatmapGrid.appendChild(headerCell);
    
    departments.forEach(dept => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell heatmap-header';
        cell.textContent = dept;
        heatmapGrid.appendChild(cell);
    });
    
    // Create data rows
    skillCategories.forEach((category, rowIndex) => {
        // Row label
        const labelCell = document.createElement('div');
        labelCell.className = 'heatmap-cell heatmap-row-label';
        labelCell.textContent = category;
        heatmapGrid.appendChild(labelCell);
        
        // Data cells
        departments.forEach((dept, colIndex) => {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            
            // Generate semi-random density value based on position
            const seed = rowIndex * HEATMAP_COLUMN_COUNT + colIndex;
            const density = HEATMAP_MIN_DENSITY + (seed * HEATMAP_DENSITY_MULTIPLIER) % HEATMAP_MAX_DENSITY_RANGE;
            
            // Color based on density
            const opacity = density / 100;
            cell.style.backgroundColor = `rgba(10, 102, 194, ${opacity})`;
            cell.style.color = opacity > 0.5 ? '#ffffff' : '#1a1a1a';
            cell.textContent = Math.floor(density);
            
            // Mark some cells as critical gaps
            if (density < HEATMAP_CRITICAL_THRESHOLD) {
                cell.classList.add('critical');
            }
            
            // Add tooltip on hover
            cell.title = `${category} in ${dept}: ${Math.floor(density)}% coverage`;
            
            heatmapGrid.appendChild(cell);
        });
    });
}

// Initialize Skill Network (D3.js)
function initializeSkillNetwork() {
    const container = document.getElementById('skillNetwork');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = 300;
    
    // Clear any existing SVG
    container.innerHTML = '';
    
    // Node data with skill status
    const nodes = [
        { id: 'Python', status: 'strong' },
        { id: 'ML', status: 'weak' },
        { id: 'K8s', status: 'weak' },
        { id: 'AWS', status: 'strong' },
        { id: 'Docker', status: 'strong' },
        { id: 'Spark', status: 'weak' },
        { id: 'TensorFlow', status: 'emerging' },
        { id: 'React', status: 'strong' },
        { id: 'SQL', status: 'strong' },
        { id: 'NLP', status: 'weak' },
        { id: 'PyTorch', status: 'emerging' },
        { id: 'Agile', status: 'strong' }
    ];
    
    // Link data
    const links = [
        { source: 'Python', target: 'ML' },
        { source: 'Python', target: 'TensorFlow' },
        { source: 'Python', target: 'PyTorch' },
        { source: 'Python', target: 'NLP' },
        { source: 'ML', target: 'TensorFlow' },
        { source: 'ML', target: 'PyTorch' },
        { source: 'TensorFlow', target: 'PyTorch' },
        { source: 'NLP', target: 'TensorFlow' },
        { source: 'K8s', target: 'Docker' },
        { source: 'AWS', target: 'K8s' },
        { source: 'AWS', target: 'Docker' },
        { source: 'Spark', target: 'Python' },
        { source: 'SQL', target: 'Spark' },
        { source: 'React', target: 'Agile' }
    ];
    
    // Color mapping
    const statusColors = {
        'strong': '#388e3c',
        'weak': '#d32f2f',
        'emerging': '#ffa726'
    };
    
    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(60))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
    
    // Create links
    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', '#d9d9d9')
        .attr('stroke-width', 2);
    
    // Create nodes
    const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // Add circles to nodes
    node.append('circle')
        .attr('r', 20)
        .attr('fill', d => statusColors[d.status])
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);
    
    // Add labels to nodes
    node.append('text')
        .text(d => d.id)
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .attr('pointer-events', 'none');
    
    // Update positions on tick
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

// Animate Metrics
function animateMetrics() {
    // Animate velocity bars
    const velocityBars = document.querySelectorAll('.velocity-bar');
    velocityBars.forEach(bar => {
        const targetWidth = bar.dataset.width;
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
        }, 100);
    });
    
    // Animate scarcity bars
    const scarcityBars = document.querySelectorAll('.scarcity-bar');
    scarcityBars.forEach(bar => {
        const targetWidth = bar.dataset.width;
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
        }, 100);
    });
    
    // Animate capacity bars
    const capacityBars = document.querySelectorAll('.capacity-bar');
    capacityBars.forEach(bar => {
        const targetWidth = bar.dataset.width;
        if (targetWidth) {
            setTimeout(() => {
                bar.style.width = targetWidth + '%';
            }, 100);
        }
    });
}

// Filter chips interaction
function initializeFilterChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', function() {
            // Remove active from siblings
            this.parentElement.querySelectorAll('.chip').forEach(c => {
                c.classList.remove('active');
            });
            // Add active to clicked chip
            this.classList.add('active');
        });
    });
}

// Project selection in matching tab
function initializeProjectSelection() {
    const projectCards = document.querySelectorAll('.project-select-card');
    projectCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active from all cards
            projectCards.forEach(c => c.classList.remove('active'));
            // Add active to clicked card
            this.classList.add('active');
            
            // Update matching title
            const projectName = this.querySelector('.project-select-title').textContent;
            const matchingTitle = document.querySelector('.matching-main h2');
            if (matchingTitle) {
                matchingTitle.textContent = `Top Matches — ${projectName}`;
            }
        });
    });
}

// Re-initialize charts when switching tabs (for animations)
function initializeTabAnimationObserver() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    // Re-animate metrics when tab becomes active
                    animateMetrics();
                }
            }
        });
    });
    
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
}
