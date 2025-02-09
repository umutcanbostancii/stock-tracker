import { Fragment, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { supabase, signOut } from '../lib/supabase';
import { 
  XMarkIcon, 
  Bars3Icon,
  ChartBarIcon,
  CubeIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Gösterge Paneli', href: '/', icon: ChartBarIcon },
  { name: 'Ürünler', href: '/products', icon: CubeIcon },
  { name: 'İşlemler', href: '/transactions', icon: ArrowPathIcon },
  { name: 'İçe Aktar', href: '/import', icon: ArrowUpTrayIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Mevcut kullanıcıyı al
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    // Kullanıcı değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Başarıyla çıkış yapıldı');
      navigate('/login');
    } catch (error: any) {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <span className="text-xl font-bold text-gray-900">Envanter</span>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={classNames(
                                  item.href === location.pathname
                                    ? 'bg-gray-50 text-teal-600'
                                    : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <item.icon
                                  className={classNames(
                                    item.href === location.pathname ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600',
                                    'h-6 w-6 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <Link
                          to="/profile"
                          className={classNames(
                            location.pathname === '/profile'
                              ? 'bg-gray-50 text-teal-600'
                              : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50',
                            'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                          )}
                        >
                          <UserIcon
                            className={classNames(
                              location.pathname === '/profile' ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          Hesabım
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                        >
                          <ArrowRightOnRectangleIcon
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-teal-600"
                            aria-hidden="true"
                          />
                          Çıkış Yap
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <span className="text-xl font-bold text-gray-900">Envanter</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={classNames(
                          item.href === location.pathname
                            ? 'bg-gray-50 text-teal-600'
                            : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.href === location.pathname ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <Link
                  to="/profile"
                  className={classNames(
                    location.pathname === '/profile'
                      ? 'bg-gray-50 text-teal-600'
                      : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50',
                    'group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                  )}
                >
                  <UserIcon
                    className={classNames(
                      location.pathname === '/profile' ? 'text-teal-600' : 'text-gray-400 group-hover:text-teal-600',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  Hesabım
                </Link>
                <button
                  onClick={handleLogout}
                  className="group -mx-2 flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:text-teal-600 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon
                    className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-teal-600"
                    aria-hidden="true"
                  />
                  Çıkış Yap
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 lg:mx-auto lg:max-w-7xl lg:px-8">
          <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-0 lg:shadow-none">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}