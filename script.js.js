// ===== SISTEMA DE CARRINHO DE COMPRAS =====

class ShoppingCart {
    constructor() {
        this.items = this.loadFromStorage();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // Abrir/fechar modal do carrinho
        const cartLink = document.querySelector('.header-icon-link:nth-child(3)'); // Meu carrinho
        const closeCartBtn = document.getElementById('closeCartBtn');
        const cartModal = document.getElementById('cartModal');

        if (cartLink) {
            cartLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCart();
            });
        }

        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => this.closeCart());
        }

        // Fechar modal ao clicar fora
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.closeCart();
                }
            });
        }

        // Botão de checkout
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        this.saveToStorage();
        this.updateCartUI();
        this.showNotification(`${product.name} adicionado ao carrinho!`);
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = parseInt(quantity);
                this.saveToStorage();
                this.updateCartUI();
            }
        }
    }

    getSubtotal() {
        return this.items.reduce((total, item) => {
            const price = typeof item.price === 'string' 
                ? parseFloat(item.price.replace('R$ ', '').replace(',', '.'))
                : item.price;
            return total + (price * item.quantity);
        }, 0);
    }

    getShipping() {
        return this.items.length > 0 ? 15 : 0; // R$ 15,00 de frete
    }

    getTotalWithShipping() {
        return this.getSubtotal() + this.getShipping();
    }

    updateCartUI() {
        this.updateCartBadge();
        this.renderCartItems();
        this.updateCartSummary();
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
        }
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyMessage = document.getElementById('emptyCartMessage');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (emptyMessage) emptyMessage.style.display = 'block';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        if (emptyMessage) emptyMessage.style.display = 'none';
        if (checkoutBtn) checkoutBtn.disabled = false;

        cartItemsContainer.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${typeof item.price === 'string' ? item.price : 'R$ ' + item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                    <input type="number" value="${item.quantity}" min="1" onchange="cart.updateQuantity(${index}, this.value)">
                    <button class="qty-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-total">
                    <p>R$ ${(this.getItemTotal(item)).toFixed(2)}</p>
                </div>
                <button class="cart-item-remove" onclick="cart.removeItem(${index})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    getItemTotal(item) {
        const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace('R$ ', '').replace(',', '.'))
            : item.price;
        return price * item.quantity;
    }

    updateCartSummary() {
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = `R$ ${this.getSubtotal().toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = `R$ ${this.getShipping().toFixed(2)}`;
        if (totalEl) totalEl.textContent = `R$ ${this.getTotalWithShipping().toFixed(2)}`;
    }

    openCart() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        const modal = document.getElementById('cartModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    checkout() {
        if (this.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const total = this.getTotalWithShipping().toFixed(2);
        const itemsList = this.items.map(item => 
            `${item.name} x${item.quantity} = R$ ${this.getItemTotal(item).toFixed(2)}`
        ).join('\n');

        alert(`Resumo do Pedido:\n\n${itemsList}\n\nFrete: R$ ${this.getShipping().toFixed(2)}\nTotal: R$ ${total}\n\nRedirecionando para pagamento...`);
        
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
        this.closeCart();
    }

    saveToStorage() {
        localStorage.setItem('buenoCart', JSON.stringify(this.items));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('buenoCart');
        return stored ? JSON.parse(stored) : [];
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateCartUI();
    }

    removeItemByIndex(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            this.saveToStorage();
            this.updateCartUI();
        }
    }
}

// Instanciar carrinho global
let cart = new ShoppingCart();

// ===== FUNCIONALIDADES DO SITE =====

// Funcionalidade de Sticky Header
window.addEventListener('scroll', function() {
    const header = document.getElementById('mainHeader');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
});

// Funcionalidade de Busca
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            alert(`Buscando por: "${searchTerm}"\n\nEsta é uma funcionalidade de demonstração.`);
            searchInput.value = '';
        } else {
            alert('Por favor, digite algo para buscar.');
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Funcionalidade dos Ícones do Header
const headerIcons = document.querySelectorAll('.header-icon-link');

headerIcons.forEach((icon, index) => {
    icon.addEventListener('click', function(e) {
        const iconName = this.querySelector('span').textContent;
        
        if (iconName === 'Meu carrinho') {
            e.preventDefault();
            cart.openCart();
        } else if (iconName === 'Minha conta') {
            e.preventDefault();
            alert('Faça login para acessar sua conta.');
        } else if (iconName === 'Atendimento') {
            e.preventDefault();
            alert('Entre em contato conosco:\nWhatsApp: (11) 95890-5933');
        }
    });
});

// Funcionalidade do Menu de Navegação
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#camisas' || href === '#calcas' || href === '#tenis' || href === '#acessorios') {
            e.preventDefault();
            const categoria = this.textContent;
            alert(`Navegando para: ${categoria}`);
        }
        else if (href === '#inicio' || href === '#produtos' || href === '#contato') {
            e.preventDefault();
            const secao = this.textContent.trim().split(' ')[0];
            
            if (secao === 'Início') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (secao === 'Produtos') {
                const productsSection = document.querySelector('.featured-products');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (secao === 'Contato') {
                const footer = document.querySelector('.main-footer');
                if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });
});

// Funcionalidade dos Botões de Adicionar ao Carrinho
const addToCartButtons = document.querySelectorAll('.btn-add-cart');

addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (!this.disabled) {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            const product = {
                id: Math.random(),
                name: productName,
                price: productPrice
            };
            
            cart.addItem(product);
            
            // Animação no botão
            this.textContent = 'Adicionado!';
            this.style.backgroundColor = '#4CAF50';
            
            setTimeout(() => {
                this.textContent = 'Adicionar ao Carrinho';
                this.style.backgroundColor = '';
            }, 2000);
        }
    });
});

// Funcionalidade do Formulário de Newsletter
const newsletterForm = document.getElementById('newsletterForm');
const emailInput = document.getElementById('emailInput');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (email && validateEmail(email)) {
            alert(`Obrigado por se inscrever!\n\nE-mail cadastrado: ${email}\n\nVocê receberá nossas promoções em breve.`);
            emailInput.value = '';
        } else {
            alert('Por favor, insira um e-mail válido.');
        }
    });
}

// Função para validar e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Funcionalidade dos Links do Footer
const footerLinks = document.querySelectorAll('.footer-column a');

footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href.startsWith('tel:') || href.startsWith('mailto:')) {
            return;
        }
        
        if (href === '#inicio') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (href === '#produtos') {
            e.preventDefault();
            const productsSection = document.querySelector('.featured-products');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (href === '#contato') {
            e.preventDefault();
            const contactSection = document.querySelector('.footer-column:nth-child(2)');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Funcionalidade do Botão WhatsApp
const whatsappBtn = document.getElementById('whatsappBtn');

if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function(e) {
        console.log('Abrindo WhatsApp...');
    });
}

// Animação de entrada para os cards de produtos
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar todos os cards de produtos
document.querySelectorAll('.product-card').forEach(card => {
    observer.observe(card);
});

// Observar itens de benefícios
document.querySelectorAll('.benefit-item').forEach(item => {
    observer.observe(item);
});

// Efeito de hover nos cards de produtos
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Log de inicialização
console.log('Bueno Importados Website - Carregado com sucesso!');
console.log('Sistema de carrinho ativo!');

// Mensagem de boas-vindas
window.addEventListener('load', function() {
    console.log('%c🛍️ Bem-vindo à Bueno Importados! 🛍️', 'font-size: 20px; font-weight: bold; color: #F4C430;');
    console.log('%cSistema de carrinho funcional ativado!', 'font-size: 14px; color: #666;');
});

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
