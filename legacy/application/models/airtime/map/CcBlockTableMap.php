<?php



/**
 * This class defines the structure of the 'cc_block' table.
 *
 *
 *
 * This map class is used by Propel to do runtime db structure discovery.
 * For example, the createSelectSql() method checks the type of a given column used in an
 * ORDER BY clause to know whether it needs to apply SQL to make the ORDER BY case-insensitive
 * (i.e. if it's a text column type).
 *
 * @package    propel.generator.airtime.map
 */
class CcBlockTableMap extends TableMap
{

    /**
     * The (dot-path) name of this class
     */
    const CLASS_NAME = 'airtime.map.CcBlockTableMap';

    /**
     * Initialize the table attributes, columns and validators
     * Relations are not initialized by this method since they are lazy loaded
     *
     * @return void
     * @throws PropelException
     */
    public function initialize()
    {
        // attributes
        $this->setName('cc_block');
        $this->setPhpName('CcBlock');
        $this->setClassname('CcBlock');
        $this->setPackage('airtime');
        $this->setUseIdGenerator(true);
        $this->setPrimaryKeyMethodInfo('cc_block_id_seq');
        // columns
        $this->addPrimaryKey('id', 'DbId', 'INTEGER', true, null, null);
        $this->addColumn('name', 'DbName', 'VARCHAR', true, 255, '');
        $this->addColumn('mtime', 'DbMtime', 'TIMESTAMP', false, 6, null);
        $this->addColumn('utime', 'DbUtime', 'TIMESTAMP', false, 6, null);
        $this->addForeignKey('creator_id', 'DbCreatorId', 'INTEGER', 'cc_subjs', 'id', false, null, null);
        $this->addColumn('description', 'DbDescription', 'VARCHAR', false, 512, null);
        $this->addColumn('length', 'DbLength', 'VARCHAR', false, null, '00:00:00');
        $this->addColumn('type', 'DbType', 'VARCHAR', false, 7, 'dynamic');
        // validators
    } // initialize()

    /**
     * Build the RelationMap objects for this table relationships
     */
    public function buildRelations()
    {
        $this->addRelation('CcSubjs', 'CcSubjs', RelationMap::MANY_TO_ONE, array('creator_id' => 'id', ), 'CASCADE', null);
        $this->addRelation('CcPlaylistcontents', 'CcPlaylistcontents', RelationMap::ONE_TO_MANY, array('id' => 'block_id', ), 'CASCADE', null, 'CcPlaylistcontentss');
        $this->addRelation('CcBlockcontents', 'CcBlockcontents', RelationMap::ONE_TO_MANY, array('id' => 'block_id', ), 'CASCADE', null, 'CcBlockcontentss');
        $this->addRelation('CcBlockcriteria', 'CcBlockcriteria', RelationMap::ONE_TO_MANY, array('id' => 'block_id', ), 'CASCADE', null, 'CcBlockcriterias');
    } // buildRelations()

    /**
     *
     * Gets the list of behaviors registered for this table
     *
     * @return array Associative array (name => parameters) of behaviors
     */
    public function getBehaviors()
    {
        return array(
            'aggregate_column' =>  array (
  'name' => 'length',
  'expression' => 'SUM(cliplength)',
  'condition' => NULL,
  'foreign_table' => 'cc_blockcontents',
  'foreign_schema' => NULL,
),
        );
    } // getBehaviors()

} // CcBlockTableMap
