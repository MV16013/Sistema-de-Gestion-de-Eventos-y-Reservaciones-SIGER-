import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function PortalLayout() {
    return (
        <div className="siger-portal">
            <Header />
            <Outlet />
        </div>
    );
}
