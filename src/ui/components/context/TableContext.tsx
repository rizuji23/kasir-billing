import { createContext, useContext, useEffect, useState } from "react";
import { IMachine, TableBilliard } from "../../../electron/types";
import { IResponses } from "../../../electron/lib/responses";
import toast from 'react-hot-toast';

interface TableBilliardContextProps {
    tableList: TableBilliard[];
    getTables: () => Promise<void>
    loading: boolean,
    total: { all: number, used: number }
    status_machine: IMachine | undefined
}

const TableBilliardContext = createContext<TableBilliardContextProps | undefined>(undefined);

export const TableBilliardProvider = ({ children }: { children: React.ReactNode }) => {
    const [tableList, setTableList] = useState<TableBilliard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [total, setTotal] = useState<{ all: number, used: number }>({ all: 0, used: 0 });
    const [status_machine, setStatusMachine] = useState<IMachine | undefined>(undefined);

    const getTables = async () => {

        try {
            const res: IResponses<TableBilliard[]> = await window.api.table_list();

            if (res.status && res.data) {
                setTableList(res.data);

            }
        } catch (err) {
            setLoading(false);
            toast.error(`Error fetching tables: ${err}`);
        }
    }

    const getTotal = async () => {
        try {
            const total_billing = await window.api.total_booking();

            if (total_billing.status && total_billing.data) {
                setTotal({
                    all: total_billing.data.total_all,
                    used: total_billing.data?.total_used
                })
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan : ${err}`);
        }
    }

    const getStatusMachine = async () => {
        try {
            const res = await window.api.get_status_machine();

            if (res.status && res.data) {
                setStatusMachine(res.data);
            }

        } catch (err) {
            toast.error(`Terjadi kesalahan : ${err}`);
        }
    }

    useEffect(() => {
        setLoading(true)
        getTables();
        getStatusMachine();
        window.api.onTableUpdate((updatedTables) => {
            setTableList(updatedTables);
            getTotal();
        });

        setInterval(() => {
            getStatusMachine();
        }, 5000);

        setLoading(false);
        return () => {
            window.api.removeTableUpdateListener();
        }
    }, []);

    // useEffect(() => {
    //     console.log("Table List", tableList)
    // }, [tableList])

    return (
        <TableBilliardContext.Provider value={{ tableList, getTables, loading, total, status_machine }}>
            {children}
        </TableBilliardContext.Provider>
    )
}

export const useTableBilliard = () => {
    const context = useContext(TableBilliardContext);
    if (!context) {
        throw new Error("useTableBilliard must be used within a TableBilliardProvider");
    }
    return context;
};
