import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Categoria from '../../../models/Categoria';
import { atualizar, buscar, cadastrar } from '../../../services/Service';
import { AuthContext } from '../../../contexts/AuthContext';
import { RotatingLines } from 'react-loader-spinner';
import { toastAlerta } from '../../../utils/toastAlerta';

function FormularioCategoria() {
    const [categoria, setCategoria] = useState<Categoria>({
        id: 0,
        nome: '',
        descricao: ''
    });

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { usuario, handleLogout } = useContext(AuthContext);
    const token = usuario.token;

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!token) {
            toastAlerta('Você precisa estar logado', 'info');
            navigate('/login');
        } else if (id) {
            buscarPorId(id);
        }
    }, [token, id, navigate]);

    async function buscarPorId(id: string) {
        try {
            setLoading(true);
            await buscar(`/categorias/${id}`, setCategoria, {
                headers: {
                    'Authorization': token
                }
            });
        } catch (error: any) {
            toastAlerta('Erro ao buscar a categoria', 'erro');
        } finally {
            setLoading(false);
        }
    }

    function atualizarEstado(e: ChangeEvent<HTMLInputElement>) {
        setCategoria({
            ...categoria,
            [e.target.name]: e.target.value
        });
    }

    async function gerarNovaCategoria(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            if (id) {
                const categoriaComId = { ...categoria, id: Number(id) };
                await atualizar(`/categorias`, categoriaComId, setCategoria, {
                    headers: {
                        'Authorization': token
                    }
                });
                toastAlerta('Categoria atualizada com sucesso', 'sucesso');
            } else {
                await cadastrar(`/categorias`, categoria, setCategoria, {
                    headers: {
                        'Authorization': token
                    }
                });
                toastAlerta('Categoria cadastrada com sucesso', 'sucesso');
            }
            retornar();
        } catch (error: any) {
            if (error.toString().includes('403')) {
                toastAlerta('O token expirou, favor logar novamente', 'info');
                handleLogout();
            } else {
                toastAlerta('Erro ao salvar a categoria', 'erro');
            }
        } finally {
            setLoading(false);
        }
    }

    function retornar() {
        navigate("/categorias");
    }

    const carregandoCategoria = categoria.descricao === '';

    return (
        <div className='bg-gray-100 min-h-screen py-6 flex flex-col justify-center'>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-4xl text-center my-4 font-bold">
                    {id ? 'Editar categoria' : 'Cadastre uma nova categoria'}
                </h1>

                <form className="w-full max-w-lg mx-auto flex flex-col gap-4" onSubmit={gerarNovaCategoria}>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="nome" className="text-lg font-semibold">Nome da categoria</label>
                        <input
                            type="text"
                            placeholder="Nome"
                            name='nome'
                            className="border-2 border-slate-700 rounded p-2 text-sm"
                            value={categoria.nome}
                            onChange={atualizarEstado}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="descricao" className="text-lg font-semibold">Descrição da categoria</label>
                        <input
                            type="text"
                            placeholder="Descrição"
                            name='descricao'
                            className="border-2 border-slate-700 rounded p-2 text-sm"
                            value={categoria.descricao}
                            onChange={atualizarEstado}
                        />
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                        <button
                            disabled={carregandoCategoria || loading}
                            className='bg-lime-500 text-stone-100 font-body font-bold text-sm p-3 rounded-lg hover:bg-lime-400 hover:text-red-700 hover:opacity-75 active:scale-95 transition-transform transform'
                            type="submit"
                        >
                            {loading ? (
                                <RotatingLines
                                    strokeColor="#18181b"
                                    strokeWidth="5"
                                    animationDuration="0.75"
                                    width="24"
                                    visible={true}
                                />
                            ) : id ? 'Editar' : 'Cadastrar'}
                        </button>
                        <button
                            type="button"
                            className="bg-gray-500 text-stone-100 font-body font-bold text-sm p-3 rounded-lg hover:bg-gray-400 hover:text-red-700 hover:opacity-75 active:scale-95 transition-transform transform"
                            onClick={retornar}
                        >
                            Voltar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FormularioCategoria;
