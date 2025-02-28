import { createContext, useContext, useEffect, useState } from "react";
import { TableBilliard } from "../../../electron/types";
import { IResponses } from "../../../electron/lib/responses";
import { toast } from "sonner";

interface TableBilliardContextProps {
    tableList: TableBilliard[];
    getTables: () => Promise<void>
    loading: boolean
}

const TableBilliardContext = createContext<TableBilliardContextProps | undefined>(undefined);

export const TableBilliardProvider = ({ children }: { children: React.ReactNode }) => {
    const [tableList, setTableList] = useState<TableBilliard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

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

    useEffect(() => {
        setLoading(true)
        getTables();

        window.api.onTableUpdate((updatedTables) => {
            setTableList(updatedTables);
        });
        setLoading(false);
        return () => {
            window.api.removeTableUpdateListener();
        }
    }, []);

    // useEffect(() => {
    //     console.log("Table List", tableList)
    // }, [tableList])

    return (
        <TableBilliardContext.Provider value={{ tableList, getTables, loading }}>
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
