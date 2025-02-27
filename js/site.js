$(document).ready(function () {
    // Variável global para armazenar o filtro ativo (categoria) e a lista completa (filtrada)
    var activeFilter = null;
    var fullList = [];
    var currentPage = 0;
    var itemsPerPage = 20;
    var isLoading = false;

    // Função que carrega mais itens da lista atual (fullList) e os adiciona na grid
    function loadMoreItems() {
        if (isLoading) return;
        isLoading = true;
        var start = currentPage * itemsPerPage;
        var end = start + itemsPerPage;
        var items = fullList.slice(start, end);
        if (items.length === 0) {
            isLoading = false;
            return;
        }
        $.each(items, function (i, produto) {
            // Gera o link do detalhe usando o filtro ativo, se houver
            var detailLink = "detalhe.html?id=" + produto.id;
            if (activeFilter) {
                detailLink += "&categoria=" + encodeURIComponent(activeFilter);
            }
            var card =
                '<div class="col-6 col-sm-6 col-md-6 col-lg-3 mb-4">' +
                '<div class="card h-100">' +
                // Container para a imagem com altura responsiva
                '<div class="card-img-container">' +
                '<img src="' + produto.imagemPerfil + '" class="card-img-top img-fluid object-fit-cover" alt="' + produto.nome + '">' +
                '</div>' +
                '<div class="card-body d-flex flex-column justify-content-between text-center">' +
                '<h5 class="card-title">' + produto.nome + '</h5>' +
                '<p class="card-text">R$ ' + produto.valor.toFixed(2) + '</p>' +
                '<a href="' + detailLink + '" class="btn btn-primary mt-auto">Detalhes</a>' +
                '</div>' +
                '</div>' +
                '</div>';
            $('#lista-produtos').append(card);
        });
        currentPage++;
        isLoading = false;
    }

    // Função para reiniciar a listagem: salva a lista completa (filtrada) e reseta a página
    function resetAndLoadList(lista) {
        fullList = lista;
        currentPage = 0;
        $('#lista-produtos').empty();
        loadMoreItems();
    }

    // Lógica para a página de listagem (index.html)
    if ($("#lista-produtos").length > 0) {
        $.getJSON('produtos.json', function (data) {
            var produtos = data.produtos;
            var categoriasUnicas = [];

            // Extraindo categorias únicas
            $.each(produtos, function (index, produto) {
                if (categoriasUnicas.indexOf(produto.categoria) === -1) {
                    categoriasUnicas.push(produto.categoria);
                }
            });

            // Gerando menu de categorias
            var menu = $('#menu-categorias');
            var btnTodos = $('<button class="btn btn-outline-primary mx-1 mb-2" data-categoria="Todos">Todos</button>');
            btnTodos.on('click', function () {
                activeFilter = null; // Sem filtro
                $('#menu-categorias button')
                    .removeClass('active btn-primary')
                    .addClass('btn-outline-primary');
                $(this).removeClass('btn-outline-primary').addClass('btn-primary active');
                history.pushState(null, '', 'index.html');
                resetAndLoadList(produtos);
            });
            menu.append(btnTodos);

            $.each(categoriasUnicas, function (i, categoria) {
                var btn = $('<button class="btn btn-outline-primary mx-1 mb-2" data-categoria="' + categoria + '">' + categoria + '</button>');
                btn.on('click', function () {
                    activeFilter = categoria;
                    $('#menu-categorias button')
                        .removeClass('active btn-primary')
                        .addClass('btn-outline-primary');
                    $(this).removeClass('btn-outline-primary').addClass('btn-primary active');
                    history.pushState(null, '', 'index.html?categoria=' + encodeURIComponent(categoria));
                    var filtrados = produtos.filter(function (produto) {
                        return produto.categoria === categoria;
                    });
                    resetAndLoadList(filtrados);
                });
                menu.append(btn);
            });

            // Se a URL já veio com um parâmetro de categoria, ativa o botão correspondente
            var urlParams = new URLSearchParams(window.location.search);
            var filtroUrl = urlParams.get('categoria');
            if (filtroUrl) {
                activeFilter = filtroUrl;
                var btnToSelect = $('#menu-categorias button[data-categoria="' + filtroUrl + '"]');
                if (btnToSelect.length) {
                    btnToSelect.trigger('click');
                } else {
                    resetAndLoadList(produtos);
                }
            } else {
                // Se não houver filtro, ativa o botão "Todos"
                $('#menu-categorias button[data-categoria="Todos"]').trigger('click');
            }
        });

        // Evento de scroll infinito: carrega mais itens quando o usuário chegar ao final da página
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
                loadMoreItems();
            }
        });
    }

    // Lógica para a página de detalhes (detalhe.html)
    if ($("#produto-detalhe").length > 0) {
        function getParameterByName(name) {
            name = name.replace(/[\[\]]/g, "\\$&");
            var url = window.location.href;
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        var idProduto = getParameterByName('id');
        if (!idProduto) {
            $('#produto-detalhe').html('<p>Produto não encontrado.</p>');
            return;
        }

        $.getJSON('produtos.json', function (data) {
            var produtos = data.produtos;
            var produto = produtos.find(function (p) {
                return p.id === idProduto;
            });

            if (!produto) {
                $('#produto-detalhe').html('<p>Produto não encontrado.</p>');
                return;
            }

            // Atualiza o título dinâmico e a aba do navegador
            $('#produto-titulo').text(produto.nome);
            var filtro = getParameterByName('categoria');
            document.title = produto.nome + " - TYQUÍNIS";

            // Atualiza o link do botão voltar, se existir
            var backLink = "index.html";
            if (filtro) {
                backLink += "?categoria=" + encodeURIComponent(filtro);
            }
            $('.back-btn').attr('href', backLink);

            // Montando o carrossel com as imagens
            var indicators = "";
            var inner = "";
            produto.imagens.forEach(function (img, index) {
                indicators += '<button type="button" data-bs-target="#carouselProduto" data-bs-slide-to="' + index + '" ' +
                    (index === 0 ? 'class="active" aria-current="true"' : '') +
                    ' aria-label="Slide ' + (index + 1) + '"></button>';
                inner += '<div class="carousel-item ' + (index === 0 ? "active" : "") + '">' +
                    '<img src="' + img + '" class="d-block w-100" alt="' + produto.nome + '">' +
                    '</div>';
            });

            var carousel = '';
            if (produto.imagens.length > 0) {
                carousel = '<div id="carouselProduto" class="carousel slide mb-4" data-bs-ride="carousel">' +
                    '<div class="carousel-indicators">' + indicators + '</div>' +
                    '<div class="carousel-inner">' + inner + '</div>' +
                    '<button class="carousel-control-prev" type="button" data-bs-target="#carouselProduto" data-bs-slide="prev">' +
                    '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
                    '<span class="visually-hidden">Anterior</span>' +
                    '</button>' +
                    '<button class="carousel-control-next" type="button" data-bs-target="#carouselProduto" data-bs-slide="next">' +
                    '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
                    '<span class="visually-hidden">Próximo</span>' +
                    '</button>' +
                    '</div>';
            }

            // Cria a mensagem para o WhatsApp
            var mensagem = "Quero comprar o [" + produto.categoria + "] - " + produto.nome + " - Valor: R$ " + produto.valor.toFixed(2);
            var linkWhatsapp = "https://wa.me/5521976825583?text=" + encodeURIComponent(mensagem);

            // Layout detalhado do produto
            var detailHTML =
                '<div class="col-lg-6 mb-4">' +
                carousel +
                '</div>' +
                '<div class="col-lg-6">' +
                '<h1 class="mb-3">' + produto.nome + '</h1>' +
                '<h3 class="text-primary mb-3">R$ ' + produto.valor.toFixed(2) + '</h3>' +
                '<p><strong>Descrição:</strong><br />' + produto.descricao + '</p>' +
                (produto.tamanhos.length ? '<p><strong>Tamanhos:</strong><br /> ' + produto.tamanhos.join(", ") + '</p>' : '') +
                (produto.cores.length ? '<p><strong>Cores:</strong><br /> ' + produto.cores.join(", ") + '</p>' : '') +
                '<a href="' + linkWhatsapp + '" class="btn btn-primary btn-lg mt-3" target="_blank">Comprar Agora</a>' +
                '</div>';

            $('#produto-detalhe').html(detailHTML);
        });
    }
});
