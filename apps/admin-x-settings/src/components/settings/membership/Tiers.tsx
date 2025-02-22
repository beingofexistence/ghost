import React, {useState} from 'react';
import SettingGroup from '../../../admin-x-ds/settings/SettingGroup';
import StripeButton from '../../../admin-x-ds/settings/StripeButton';
import TabView from '../../../admin-x-ds/global/TabView';
import TiersList from './tiers/TiersList';
import clsx from 'clsx';
import useRouting from '../../../hooks/useRouting';
import {Tier, getActiveTiers, getArchivedTiers, useBrowseTiers} from '../../../api/tiers';
import {checkStripeEnabled} from '../../../api/settings';
import {useGlobalData} from '../../providers/GlobalDataProvider';

const StripeConnectedButton: React.FC<{className?: string; onClick: () => void;}> = ({className, onClick}) => {
    className = clsx(
        'group flex shrink-0 items-center justify-center whitespace-nowrap rounded border border-grey-300 px-3 py-1.5 text-sm font-semibold text-grey-900 transition-all hover:border-grey-500',
        className
    );
    return (
        <button className={className} type='button' onClick={onClick}>
            <span className="inline-flex h-2 w-2 rounded-full bg-green transition-all group-hover:bg-[#625BF6]"></span>
            <span className='ml-2'>Connected to Stripe</span>
        </button>
    );
};

const Tiers: React.FC<{ keywords: string[] }> = ({keywords}) => {
    const [selectedTab, setSelectedTab] = useState('active-tiers');
    const {settings, config} = useGlobalData();
    const {data: {tiers} = {}} = useBrowseTiers();
    const activeTiers = getActiveTiers(tiers || []);
    const archivedTiers = getArchivedTiers(tiers || []);
    const {updateRoute} = useRouting();

    const openConnectModal = () => {
        updateRoute('stripe-connect');
    };

    const sortTiers = (t: Tier[]) => {
        t.sort((a, b) => {
            if ((a.monthly_price as number) < (b.monthly_price as number)) {
                return -1;
            } else {
                return 1;
            }
        });
        return t;
    };

    const tabs = [
        {
            id: 'active-tiers',
            title: 'Active',
            contents: (<TiersList tab='active-tiers' tiers={sortTiers(activeTiers)} />)
        },
        {
            id: 'archived-tiers',
            title: 'Archived',
            contents: (<TiersList tab='archive-tiers' tiers={sortTiers(archivedTiers)} />)
        }
    ];

    let content;
    if (checkStripeEnabled(settings, config)) {
        content = <TabView selectedTab={selectedTab} tabs={tabs} onTabChange={setSelectedTab} />;
    } else {
        content = <TiersList tab='free-tier' tiers={activeTiers.filter(tier => tier.type === 'free')} />;
    }

    return (
        <SettingGroup
            customButtons={checkStripeEnabled(settings, config) ?
                <StripeConnectedButton className='hidden tablet:!visible tablet:!block' onClick={openConnectModal} />
                :
                <StripeButton className='hidden tablet:!visible tablet:!block' onClick={openConnectModal}/>}
            description='Set prices and paid member sign up settings'
            keywords={keywords}
            navid='tiers'
            testId='tiers'
            title='Tiers'
        >
            <div className='w-full tablet:hidden'>
                {checkStripeEnabled(settings, config) ?
                    <StripeConnectedButton className='w-full' onClick={openConnectModal} />
                    :
                    <StripeButton onClick={openConnectModal}/>
                }
            </div>

            {content}
        </SettingGroup>
    );
};

export default Tiers;
